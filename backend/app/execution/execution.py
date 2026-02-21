from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    timeout: int = 5

@app.post("/execute")
async def execute_code(request: CodeRequest):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as tmp:
            tmp.write(request.code.encode("utf-8"))
            tmp_path = tmp.name

        result = subprocess.run(
            ["python", tmp_path],
            capture_output=True,
            text=True,
            timeout=request.timeout
        )

        os.remove(tmp_path)

        return {
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr
        }

    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out"}

    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "Demo Code Execution API Running "}

@app.get("/health")
async def health():
    return {"status": "ok"}