"""
Code Execution Engine

Supports Docker-based execution (preferred) with subprocess fallback.
Python runs via python subprocess, JavaScript runs via node subprocess.
"""

import uuid
import asyncio
import subprocess
import sys
import tempfile
import os

# Try Docker first (sandboxed, preferred)
try:
    import docker
    docker_client = docker.from_env()
    docker_client.ping()  # Verify Docker is actually responsive
    print("[EXECUTION] Docker client initialized successfully")
except Exception as e:
    docker_client = None
    print(f"[EXECUTION] Docker not available, using subprocess fallback - {e}")


async def run_code(code: str, timeout: int = 10, language: str = "python"):
    """
    Execute code and return output.
    - JavaScript always uses subprocess (Node.js)
    - Python uses Docker if available, with subprocess fallback
    """
    # JavaScript always runs via Node.js subprocess
    if language in ("javascript", "js"):
        return await _run_with_subprocess(code, timeout, language)

    # Python: try Docker first, fall back to subprocess
    if docker_client is not None:
        result = await _run_with_docker(code, timeout)
        # If Docker failed (e.g. missing image), fall back to subprocess
        if result.get("error") and "No such image" in str(result.get("error", "")):
            print(f"[EXECUTION] Docker failed, falling back to subprocess: {result['error']}")
            return await _run_with_subprocess(code, timeout, language)
        return result
    else:
        return await _run_with_subprocess(code, timeout, language)


async def _run_with_docker(code: str, timeout: int = 10):
    """Execute Python code in a Docker container (sandboxed)."""
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
            stdin_open=False,
            tty=False,
            detach=True
        )

        container.start()

        try:
            container.wait(timeout=timeout)
        except Exception:
            container.kill()
            return {"error": "Execution timed out"}

        logs = container.logs(stdout=True, stderr=True).decode("utf-8")
        exit_code = container.attrs["State"]["ExitCode"]

        return {
            "exit_code": exit_code,
            "output": logs
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass


async def _run_with_subprocess(code: str, timeout: int = 10, language: str = "python"):
    """
    Execute code using subprocess (fallback when Docker is unavailable).
    Supports Python and JavaScript.
    """
    tmp_file = None
    try:
        # Determine command based on language
        if language in ("javascript", "js"):
            suffix = ".js"
            cmd_prefix = ["node"]
        else:
            # Default to Python
            suffix = ".py"
            cmd_prefix = [sys.executable, "-u"]

        # Write code to a temporary file
        tmp_file = tempfile.NamedTemporaryFile(
            mode='w', suffix=suffix, delete=False, encoding='utf-8'
        )
        tmp_file.write(code)
        tmp_file.close()

        # Run the code as a subprocess
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

        # Combine stdout and stderr
        combined_output = output
        if error_output:
            combined_output = combined_output + error_output if combined_output else error_output

        return {
            "exit_code": proc.returncode,
            "output": combined_output,
            "error": error_output if proc.returncode != 0 else None
        }

    except FileNotFoundError as e:
        if language in ("javascript", "js"):
            return {"error": "Node.js is not installed. Please install Node.js to run JavaScript code."}
        return {"error": f"Runtime not found: {e}"}

    except Exception as e:
        return {"error": str(e)}

    finally:
        # Clean up temp file
        if tmp_file and os.path.exists(tmp_file.name):
            try:
                os.unlink(tmp_file.name)
            except Exception:
                pass