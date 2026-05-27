import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database
import models
from pipeline import pipeline

app = FastAPI(title="ChromaCrystal_UHD API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
database.Base.metadata.create_all(bind=database.engine)

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

def process_image_background(job_id: str, input_path: str, output_path: str, db: Session, upscale_factor: int, color_intensity: float, denoise_strength: int):
    try:
        def update_progress(p: float):
            job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
            if job:
                job.progress = p
                db.commit()

        pipeline.process_image(input_path, output_path, progress_callback=update_progress, upscale_factor=upscale_factor, color_intensity=color_intensity, denoise_strength=denoise_strength)
        
        job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
        if job:
            job.status = "completed"
            job.progress = 1.0
            import datetime
            job.completed_at = datetime.datetime.utcnow()
            db.commit()
    except Exception as e:
        job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()

@app.post("/api/v1/upload")
async def upload_image(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    upscale_factor: int = Form(4),
    color_intensity: float = Form(1.0),
    denoise_strength: int = Form(10),
    db: Session = Depends(database.get_db)
):
    job_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    input_filename = f"{job_id}_input.{ext}"
    output_filename = f"{job_id}_output.jpg"
    
    input_path = os.path.join(UPLOAD_DIR, input_filename)
    output_path = os.path.join(PROCESSED_DIR, output_filename)
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    job = models.ImageJob(
        id=job_id,
        original_filename=file.filename,
        result_filename=output_filename,
        status="processing",
        progress=0.0
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    background_tasks.add_task(process_image_background, job_id, input_path, output_path, db, upscale_factor, color_intensity, denoise_strength)
    
    return {"job_id": job_id, "status": "processing"}

@app.get("/api/v1/status/{job_id}")
def get_status(job_id: str, db: Session = Depends(database.get_db)):
    job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.get("/api/v1/history")
def get_history(db: Session = Depends(database.get_db)):
    jobs = db.query(models.ImageJob).order_by(models.ImageJob.created_at.desc()).all()
    return jobs

@app.get("/api/v1/download/{job_id}")
def download_image(job_id: str, db: Session = Depends(database.get_db)):
    job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
    if not job or job.status != "completed":
        raise HTTPException(status_code=404, detail="Processed image not ready or found")
    
    output_path = os.path.join(PROCESSED_DIR, job.result_filename)
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="File missing on disk")
        
    return FileResponse(output_path, media_type="image/jpeg", filename=f"ChromaCrystal_{job.original_filename}")
