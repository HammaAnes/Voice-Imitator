from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks
from pathlib import Path
from pydantic import BaseModel
from services.preprocess import preprocess_audio
from services.use_tts import use_tts_model
import uuid
import logging


logger = logging.getLogger(__name__)
jobs = {}

class ClonePayload(BaseModel):
    sentence: str
    language: str

router = APIRouter()

@router.post("/upload/")
async def upload_file(
    file: UploadFile, 
    sentence: str = Form(...),
    language: str = Form(...),
    background_task: BackgroundTasks = None
):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing"}  # <-- add this

    path = Path(f"../uploads/{file.filename}")
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)

    background_task.add_task(run_clone_voice, job_id, file.filename, sentence, language)
    return {"job_id": job_id}

def run_clone_voice(job_id, filename, sentence, language):
    try:
        preprocess_audio(filename)
        use_tts_model(sentence= sentence, language= language)
        output_path = f"../output/output.wav"
        jobs[job_id] = {"status": "done", "output_path": output_path}
    except Exception as e:
        logger.exception(f"Job {job_id} failed")
        jobs[job_id] = {"status": "error", "detail": str(e)}

@router.get("/status/{job_id}")
def get_status(job_id: str):
    return jobs.get(job_id, {"status": "not found"})

@router.get("/result/{job_id}")
def get_result(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return {"error": "job not found"}
    if job["status"] == "processing":
        return {"error": "not ready"}
    if job["status"] == "error":
        return {"error": "job failed", "detail": job.get("detail")}
    return FileResponse(job["output_path"], media_type="audio/wav")