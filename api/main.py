import os
import uuid
import shutil
import asyncio
import datetime
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
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

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Global async task queue
job_queue = asyncio.Queue()

def run_migrations():
    """Dynamically inspects and adds missing columns to SQLite table without losing data."""
    # Ensure tables are created first
    database.Base.metadata.create_all(bind=database.engine)
    
    inspector = inspect(database.engine)
    columns = [col['name'] for col in inspector.get_columns('image_jobs')]
    
    with database.engine.connect() as conn:
        transaction = conn.begin()
        try:
            modified = False
            if 'upscale_factor' not in columns:
                conn.execute(text("ALTER TABLE image_jobs ADD COLUMN upscale_factor INTEGER DEFAULT 4"))
                modified = True
            if 'color_intensity' not in columns:
                conn.execute(text("ALTER TABLE image_jobs ADD COLUMN color_intensity FLOAT DEFAULT 1.0"))
                modified = True
            if 'denoise_strength' not in columns:
                conn.execute(text("ALTER TABLE image_jobs ADD COLUMN denoise_strength INTEGER DEFAULT 10"))
                modified = True
            
            if modified:
                transaction.commit()
                print("Database migrations applied successfully.")
            else:
                transaction.rollback()
                print("Database schema is up to date.")
        except Exception as e:
            transaction.rollback()
            print(f"Error executing database migrations: {e}")

async def queue_worker():
    """Sequential FIFO background worker running heavy pipeline jobs one at a time."""
    print("Queue Worker: Starting worker thread loop...")
    while True:
        try:
            job_item = await job_queue.get()
            job_id, input_path, output_path, upscale_factor, color_intensity, denoise_strength = job_item
            print(f"Queue Worker: Processing job {job_id}...")
            
            db = database.SessionLocal()
            try:
                job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
                if job:
                    job.status = "processing"
                    job.progress = 0.0
                    db.commit()
                
                def update_progress(p: float):
                    # Separate session update for safety across threads/loop steps
                    db_inner = database.SessionLocal()
                    try:
                        job_inner = db_inner.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
                        if job_inner:
                            job_inner.progress = p
                            db_inner.commit()
                    finally:
                        db_inner.close()
                
                # Execute pipeline inside an external thread pool to prevent blocking the async event loop
                loop = asyncio.get_running_loop()
                await loop.run_in_executor(
                    None,
                    pipeline.process_image,
                    input_path,
                    output_path,
                    update_progress,
                    upscale_factor,
                    color_intensity,
                    denoise_strength
                )
                
                # Mark as completed
                job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
                if job:
                    job.status = "completed"
                    job.progress = 1.0
                    job.completed_at = datetime.datetime.utcnow()
                    db.commit()
                print(f"Queue Worker: Job {job_id} completed successfully.")
            except Exception as e:
                print(f"Queue Worker: Error processing job {job_id}: {e}")
                job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
                if job:
                    job.status = "failed"
                    job.error_message = str(e)
                    db.commit()
            finally:
                db.close()
                job_queue.task_done()
        except Exception as ex:
            print(f"Queue Worker: Unexpected worker thread error: {ex}")
            await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    # 1. Run migrations and verify schema
    run_migrations()
    
    # 2. Start the queue worker task
    asyncio.create_task(queue_worker())
    
    # 3. Recover stuck or pending jobs on boot
    db = database.SessionLocal()
    try:
        # Reset stuck 'processing' jobs (interrupted by server crash/restart) back to 'pending'
        stuck_jobs = db.query(models.ImageJob).filter(models.ImageJob.status == "processing").all()
        if stuck_jobs:
            print(f"Startup Recovery: Found {len(stuck_jobs)} stuck processing jobs. Resetting to pending...")
            for job in stuck_jobs:
                job.status = "pending"
                job.progress = 0.0
            db.commit()
            
        # Push all pending jobs to the asyncio Queue in chronological order
        pending_jobs = db.query(models.ImageJob).filter(models.ImageJob.status == "pending").order_by(models.ImageJob.created_at.asc()).all()
        if pending_jobs:
            print(f"Startup Recovery: Enqueueing {len(pending_jobs)} pending jobs...")
            for job in pending_jobs:
                # Reconstruct original input file extension and paths
                orig_ext = job.original_filename.split('.')[-1].lower() if '.' in job.original_filename else 'jpg'
                input_filename = f"{job.id}_input.{orig_ext}"
                input_path = os.path.join(UPLOAD_DIR, input_filename)
                output_path = os.path.join(PROCESSED_DIR, job.result_filename)
                
                await job_queue.put((
                    job.id,
                    input_path,
                    output_path,
                    job.upscale_factor or 4,
                    job.color_intensity or 1.0,
                    job.denoise_strength or 10
                ))
    except Exception as e:
        print(f"Startup Recovery: Failed to recover jobs: {e}")
    finally:
        db.close()

@app.post("/api/v1/upload")
async def upload_image(
    file: UploadFile = File(...),
    upscale_factor: int = Form(4),
    color_intensity: float = Form(1.0),
    denoise_strength: int = Form(10),
    db: Session = Depends(database.get_db)
):
    job_id = str(uuid.uuid4())
    original_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
    ext = original_ext
    if ext in ['heic', 'heif']:
        ext = 'jpg'
        
    input_filename = f"{job_id}_input.{original_ext}"
    output_filename = f"{job_id}_output.{ext}"
    input_path = os.path.join(UPLOAD_DIR, input_filename)
    output_path = os.path.join(PROCESSED_DIR, output_filename)
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    job = models.ImageJob(
        id=job_id,
        original_filename=file.filename,
        result_filename=output_filename,
        upscale_factor=upscale_factor,
        color_intensity=color_intensity,
        denoise_strength=denoise_strength,
        status="pending",
        progress=0.0
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Enqueue job
    await job_queue.put((
        job_id,
        input_path,
        output_path,
        upscale_factor,
        color_intensity,
        denoise_strength
    ))
    
    return {"job_id": job_id, "status": "pending"}

@app.get("/api/v1/status/{job_id}")
def get_status(job_id: str, db: Session = Depends(database.get_db)):
    job = db.query(models.ImageJob).filter(models.ImageJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Calculate queue position for pending jobs
    queue_position = None
    if job.status == "pending":
        queue_position = db.query(models.ImageJob).filter(
            models.ImageJob.status == "pending",
            models.ImageJob.created_at < job.created_at
        ).count()
        
    return {
        "id": job.id,
        "status": job.status,
        "progress": job.progress,
        "original_filename": job.original_filename,
        "result_filename": job.result_filename,
        "created_at": job.created_at,
        "completed_at": job.completed_at,
        "error_message": job.error_message,
        "upscale_factor": job.upscale_factor,
        "color_intensity": job.color_intensity,
        "denoise_strength": job.denoise_strength,
        "queue_position": queue_position
    }

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

# Mount static frontend
os.makedirs("public", exist_ok=True)
app.mount("/", StaticFiles(directory="public", html=True), name="static")
