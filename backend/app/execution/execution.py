"""
Code Execution Engine (Interactive)

Supports interactive code execution with stdin/stdout streaming.
Uses thread-based readers on Windows for reliable unbuffered pipe I/O.
Python runs via python subprocess, JavaScript runs via node subprocess.
"""

import uuid
import asyncio
import sys
import tempfile
import os
import threading

# Try Docker first (sandboxed, preferred)
try:
    import docker
    docker_client = docker.from_env()
    docker_client.ping()
    print("[EXECUTION] Docker client initialized successfully")
except Exception as e:
    docker_client = None
    print(f"[EXECUTION] Docker not available, using subprocess fallback - {e}")

# Store running processes: {session_id: {proc, tmp_file, language}}
running_processes = {}


async def start_interactive(code: str, session_id: str, timeout: int = 30,
                            language: str = "python", on_output=None, on_done=None):
    """
    Start an interactive code execution process.
    Output is streamed via on_output callback.
    When the process ends, on_done is called with the exit code.
    """
    tmp_file_path = None
    try:
        # Determine command based on language
        if language in ("javascript", "js"):
            suffix = ".js"
            cmd_prefix = ["node"]
        else:
            suffix = ".py"
            cmd_prefix = [sys.executable, "-u"]

        # Write code to a temporary file
        tmp_file = tempfile.NamedTemporaryFile(
            mode='w', suffix=suffix, delete=False, encoding='utf-8'
        )
        tmp_file.write(code)
        tmp_file.close()
        tmp_file_path = tmp_file.name

        print(f"[EXECUTION] Starting: {' '.join(cmd_prefix)} {tmp_file_path}")

        # Use subprocess.Popen directly with raw pipes for reliable Windows I/O
        import subprocess
        proc = subprocess.Popen(
            [*cmd_prefix, tmp_file_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            bufsize=0,  # Unbuffered
        )

        # Store the process reference
        running_processes[session_id] = {
            'proc': proc,
            'tmp_file': tmp_file_path,
            'language': language,
        }

        print(f"[EXECUTION] Process started pid={proc.pid}")

        loop = asyncio.get_event_loop()

        # Thread-based reader for a pipe — reads byte by byte to deliver
        # prompts like input("name: ") immediately without waiting for \n
        async def read_pipe_threaded(pipe, is_error=False):
            """Read from a pipe using a thread, push chunks into async."""
            def _blocking_reader():
                """Runs in a thread. Reads small chunks and pushes to queue."""
                chunks = []
                try:
                    while True:
                        byte = pipe.read(1)
                        if not byte:
                            # EOF
                            if chunks:
                                result_queue.put(b''.join(chunks))
                            result_queue.put(None)  # Sentinel for EOF
                            return
                        chunks.append(byte)
                        # Flush on newline or if we have enough data
                        if byte == b'\n' or len(chunks) >= 256:
                            result_queue.put(b''.join(chunks))
                            chunks = []
                        elif not _has_pending_data(pipe):
                            # No more immediately available data — flush what we have
                            # This ensures prompts without \n get delivered
                            if chunks:
                                result_queue.put(b''.join(chunks))
                                chunks = []
                except Exception:
                    if chunks:
                        result_queue.put(b''.join(chunks))
                    result_queue.put(None)

            import queue
            result_queue = queue.Queue()

            # Start the blocking reader in a thread
            reader_thread = threading.Thread(target=_blocking_reader, daemon=True)
            reader_thread.start()

            # Consume from queue in the async loop
            while True:
                try:
                    data = await asyncio.wait_for(
                        loop.run_in_executor(None, result_queue.get, True, 0.3),
                        timeout=0.5
                    )
                    if data is None:
                        # EOF
                        break
                    text = data.decode('utf-8', errors='replace')
                    if on_output and text:
                        await on_output(text, is_error)
                except (asyncio.TimeoutError, Exception):
                    # Check if process has ended
                    if proc.poll() is not None:
                        # Drain remaining items
                        import queue as q_module
                        while True:
                            try:
                                data = result_queue.get_nowait()
                                if data is None:
                                    break
                                text = data.decode('utf-8', errors='replace')
                                if on_output and text:
                                    await on_output(text, is_error)
                            except q_module.Empty:
                                break
                        break
                    continue

        # Timeout killer
        async def timeout_killer():
            await asyncio.sleep(timeout)
            if proc.poll() is None:
                try:
                    proc.kill()
                except Exception:
                    pass
                if on_output:
                    await on_output("\n⏱ Execution timed out\n", True)

        timeout_task = asyncio.create_task(timeout_killer())

        # Read both streams concurrently
        await asyncio.gather(
            read_pipe_threaded(proc.stdout, False),
            read_pipe_threaded(proc.stderr, True),
        )

        # Wait for process to finish
        proc.wait(timeout=5)
        timeout_task.cancel()

        exit_code = proc.returncode or 0
        print(f"[EXECUTION] Finished exit_code={exit_code}")

        # Clean up
        _cleanup(session_id)

        if on_done:
            await on_done(exit_code)

        return exit_code

    except FileNotFoundError:
        msg = ("Node.js is not installed." if language in ("javascript", "js")
               else "Python runtime not found.")
        print(f"[EXECUTION] FileNotFoundError: {msg}")
        if on_output:
            await on_output(msg + "\n", True)
        if on_done:
            await on_done(1)
        _cleanup(session_id)
        return 1

    except Exception as e:
        print(f"[EXECUTION] Exception: {e}")
        import traceback
        traceback.print_exc()
        if on_output:
            await on_output(f"Error: {str(e)}\n", True)
        if on_done:
            await on_done(1)
        _cleanup(session_id)
        return 1


def _has_pending_data(pipe):
    """Check if a pipe has data available to read (non-blocking)."""
    if sys.platform == 'win32':
        import msvcrt
        try:
            # On Windows, check if there are bytes available in the pipe
            import ctypes
            kernel32 = ctypes.windll.kernel32
            handle = msvcrt.get_osfhandle(pipe.fileno())
            avail = ctypes.c_ulong(0)
            result = kernel32.PeekNamedPipe(
                handle, None, 0, None, ctypes.byref(avail), None
            )
            return result and avail.value > 0
        except Exception:
            return False
    else:
        import select
        r, _, _ = select.select([pipe], [], [], 0)
        return bool(r)


async def send_input(session_id: str, text: str):
    """Send input to a running process."""
    entry = running_processes.get(session_id)
    if entry:
        proc = entry['proc']
        if proc.poll() is None and proc.stdin:
            try:
                proc.stdin.write((text + '\n').encode('utf-8'))
                proc.stdin.flush()
                print(f"[EXECUTION] Sent input to pid {proc.pid}: {repr(text)}")
                return True
            except Exception as e:
                print(f"[EXECUTION] Error sending input: {e}")
                return False
    print(f"[EXECUTION] No running process for session {session_id}")
    return False


async def stop_process(session_id: str):
    """Stop a running process."""
    entry = running_processes.get(session_id)
    if entry:
        proc = entry['proc']
        if proc.poll() is None:
            try:
                proc.kill()
                print(f"[EXECUTION] Killed pid {proc.pid}")
            except Exception:
                pass
    _cleanup(session_id)


def _cleanup(session_id: str):
    """Clean up process resources."""
    entry = running_processes.pop(session_id, None)
    if entry:
        tmp_file = entry.get('tmp_file')
        if tmp_file and os.path.exists(tmp_file):
            try:
                os.unlink(tmp_file)
            except Exception:
                pass


# ──────────────────────────────────────────────────────────
# Legacy non-interactive execution (kept for Docker path)
# ──────────────────────────────────────────────────────────

async def run_code(code: str, timeout: int = 10, language: str = "python"):
    """Non-interactive execution. Used as fallback for Docker."""
    if language in ("javascript", "js"):
        return await _run_non_interactive(code, timeout, language)

    if docker_client is not None:
        result = await _run_with_docker(code, timeout)
        if result.get("error") and "No such image" in str(result.get("error", "")):
            return await _run_non_interactive(code, timeout, language)
        return result
    else:
        return await _run_non_interactive(code, timeout, language)


async def _run_with_docker(code: str, timeout: int = 10):
    """Execute Python code in a Docker container (non-interactive)."""
    container = None
    container_name = f"code-exec-{uuid.uuid4().hex[:8]}"
    try:
        container = docker_client.containers.create(
            image="python:3.11-slim",
            command=["python", "-u", "-c", code],
            name=container_name,
            mem_limit="256m",
            cpu_quota=50000,
            network_mode="none",
            stdin_open=False, tty=False, detach=True
        )
        container.start()
        try:
            container.wait(timeout=timeout)
        except Exception:
            container.kill()
            return {"error": "Execution timed out"}
        logs = container.logs(stdout=True, stderr=True).decode("utf-8")
        exit_code = container.attrs["State"]["ExitCode"]
        return {"exit_code": exit_code, "output": logs}
    except Exception as e:
        return {"error": str(e)}
    finally:
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass


async def _run_non_interactive(code: str, timeout: int = 10, language: str = "python"):
    """Non-interactive subprocess execution."""
    tmp_file = None
    try:
        if language in ("javascript", "js"):
            suffix = ".js"
            cmd_prefix = ["node"]
        else:
            suffix = ".py"
            cmd_prefix = [sys.executable, "-u"]

        tmp_file = tempfile.NamedTemporaryFile(
            mode='w', suffix=suffix, delete=False, encoding='utf-8'
        )
        tmp_file.write(code)
        tmp_file.close()

        proc = await asyncio.create_subprocess_exec(
            *cmd_prefix, tmp_file.name,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(), timeout=timeout
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.communicate()
            return {"error": "⏱ Execution timed out"}

        output = stdout.decode("utf-8", errors="replace")
        error_output = stderr.decode("utf-8", errors="replace")
        combined = output + error_output if error_output else output

        return {
            "exit_code": proc.returncode,
            "output": combined,
            "error": error_output if proc.returncode != 0 else None
        }

    except FileNotFoundError:
        if language in ("javascript", "js"):
            return {"error": "Node.js is not installed."}
        return {"error": "Runtime not found"}
    except Exception as e:
        return {"error": str(e)}
    finally:
        if tmp_file and os.path.exists(tmp_file.name):
            try:
                os.unlink(tmp_file.name)
            except Exception:
                pass