import docker
import uuid
import asyncio

docker_client = docker.from_env()

async def run_code(code: str, timeout: int = 10):
    container = None
    container_name = f"code-exec-{uuid.uuid4().hex[:8]}"

    try:
        container = docker_client.containers.create(
            image="python:3.11-slim",
            command=["python", "-u", "-c", code],
            name=container_name,
            mem_limit="256m",
            cpu_quota=50000,  # ~50% CPU
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
            return {
                "error": "Execution timed out"
            }

        logs = container.logs(stdout=True, stderr=True).decode("utf-8")
        exit_code = container.attrs["State"]["ExitCode"]

        return {
            "exit_code": exit_code,
            "output": logs
        }

    except Exception as e:
        return {
            "error": str(e)
        }

    finally:
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass