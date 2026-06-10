import os
import uuid
import shutil
import asyncio
import datetime
import time
import concurrent.futures
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
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

# In-Memory Jobs Dictionary replacing SQLite!
jobs = {}

# Ephemeral ThreadPool for Zero-Crash Memory Isolation
# Limit to 3 concurrent users so the 16GB CPU RAM doesn't crash!
executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)

def process_wrapper(job_id, input_path, output_path, upscale_factor, color_intensity, denoise_strength, enable_colorization, enable_face_restoration, enable_upscaling):
    print(f"ThreadPool: Processing job {job_id}...")
    try:
        # Mark as processing (might have been pending if thread pool was full)
        jobs[job_id]["status"] = "processing"
        
        def update_progress(p: float):
            if job_id in jobs:
                jobs[job_id]["progress"] = p
                jobs[job_id]["last_pinged"] = time.time()
                
                # Check for cancellation heartbeat
                if jobs[job_id].get("cancel_flag", False):
                    raise Exception("Job cancelled due to heartbeat timeout (Browser closed).")

        # Execute heavy pipeline
        pipeline.process_image(
            input_path=input_path,
            output_path=output_path,
            progress_callback=update_progress,
            upscale_factor=upscale_factor,
            color_intensity=color_intensity,
            denoise_strength=denoise_strength,
            cancel_check=None,
            enable_colorization=enable_colorization,
            enable_face_restoration=enable_face_restoration,
            enable_upscaling=enable_upscaling
        )
        
        if job_id in jobs:
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["progress"] = 1.0
            jobs[job_id]["completed_at"] = datetime.datetime.utcnow().isoformat()
        print(f"ThreadPool: Job {job_id} completed successfully.")
        
    except Exception as e:
        print(f"ThreadPool: Error processing job {job_id}: {e}")
        if job_id in jobs:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error_message"] = str(e)

async def heartbeat_sweeper():
    """Background sweeper that kills jobs if the user closes their browser!"""
    while True:
        await asyncio.sleep(5)
        current_time = time.time()
        for j_id, j_data in list(jobs.items()):
            if j_data["status"] in ["pending", "processing"]:
                # If no status ping in 15 seconds, assume browser closed
                if current_time - j_data.get("last_pinged", current_time) > 15:
                    print(f"Sweeper: Job {j_id} lost heartbeat. Canceling!")
                    j_data["cancel_flag"] = True
                    j_data["status"] = "failed"
                    j_data["error_message"] = "Browser closed."

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(heartbeat_sweeper())
    print("Zero-Crash ThreadPool Architecture Started!")

@app.post("/api/v1/upload")
async def upload_image(
    file: UploadFile = File(...),
    upscale_factor: int = Form(4),
    color_intensity: float = Form(1.0),
    denoise_strength: int = Form(10),
    enable_colorization: bool = Form(True),
    enable_face_restoration: bool = Form(True),
    enable_upscaling: bool = Form(True)
):
    job_id = str(uuid.uuid4())
    original_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
    ext = original_ext
    if ext in ['heic', 'heif']: ext = 'jpg'
        
    input_filename = f"{job_id}_input.{original_ext}"
    output_filename = f"{job_id}_output.{ext}"
    input_path = os.path.join(UPLOAD_DIR, input_filename)
    output_path = os.path.join(PROCESSED_DIR, output_filename)
    
    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Initialize job in memory
    jobs[job_id] = {
        "id": job_id,
        "original_filename": file.filename,
        "result_filename": output_filename,
        "upscale_factor": upscale_factor,
        "color_intensity": color_intensity,
        "denoise_strength": denoise_strength,
        "enable_colorization": enable_colorization,
        "enable_face_restoration": enable_face_restoration,
        "enable_upscaling": enable_upscaling,
        "status": "pending",
        "progress": 0.0,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "completed_at": None,
        "error_message": None,
        "last_pinged": time.time(),
        "cancel_flag": False
    }
    
    # Launch job immediately in thread pool
    loop = asyncio.get_running_loop()
    loop.run_in_executor(
        executor, 
        process_wrapper, 
        job_id, 
        input_path, 
        output_path, 
        upscale_factor, 
        color_intensity, 
        denoise_strength,
        enable_colorization,
        enable_face_restoration,
        enable_upscaling
    )
    
    return {"job_id": job_id, "status": "pending"}

@app.get("/api/v1/status/{job_id}")
def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job = jobs[job_id]
    job["last_pinged"] = time.time()  # Update heartbeat
    
    # Calculate queue position for pending jobs
    queue_position = None
    if job["status"] == "pending":
        # Count how many pending jobs were created before this one
        pending_jobs = [j for j in jobs.values() if j["status"] == "pending"]
        queue_position = sum(1 for j in pending_jobs if j["created_at"] < job["created_at"])
        
    # Safely convert to dictionary format matching the old DB response
    return {
        "id": job["id"],
        "status": job["status"],
        "progress": job["progress"],
        "original_filename": job["original_filename"],
        "result_filename": job["result_filename"],
        "created_at": job["created_at"],
        "completed_at": job["completed_at"],
        "error_message": job["error_message"],
        "queue_position": queue_position
    }

@app.get("/api/v1/download/{job_id}")
def download_image(job_id: str):
    if job_id not in jobs or jobs[job_id]["status"] != "completed":
        raise HTTPException(status_code=404, detail="Processed image not ready or found")
    
    output_path = os.path.join(PROCESSED_DIR, jobs[job_id]["result_filename"])
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="File missing on disk")
        
    return FileResponse(output_path, media_type="image/jpeg", filename=f"ChromaCrystal_{jobs[job_id]['original_filename']}")

# Mount static frontend
os.makedirs("public", exist_ok=True)
app.mount("/", StaticFiles(directory="public", html=True), name="static")
