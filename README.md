# ChromaCrystal_UHD 🎨✨

**Transform Black & White Memories Into Ultra-HD Reality.**

ChromaCrystal_UHD is an enterprise-grade, memory-optimized AI pipeline that colorizes, enhances, and upscales vintage photographs. Built with an unbreakable Zero-Crash Memory Isolation architecture, it can seamlessly process massive AI inferences (like DeOldify, GFPGAN, and Real-ESRGAN) on a single machine without ever running out of RAM.

![ChromaCrystal UI Demo](https://raw.githubusercontent.com/BhavyaKansal20/ChromaCrystal_UHD/main/public/demo.jpg)

## 🔥 Features

- **AI Colorization (DeOldify)**: Authentically restores accurate colors to black and white photographs.
- **Facial Restoration (GFPGAN)**: Automatically detects and restores blurry, degraded faces to crystal-clear high definition.
- **HD Upscaling (Real-ESRGAN)**: AI-powered super-resolution up to 8x without losing quality.
- **Zero-Crash Memory Isolation**: Each heavy PyTorch model runs in a strictly isolated OS-level subprocess, ensuring 100% immediate VRAM/RAM reclamation. It is mathematically impossible to OOM crash.
- **Asynchronous Task Queue**: Upload 1,000 images at once—the built-in SQLite queue worker will flawlessly process them sequentially while serving real-time queue position UI updates to the frontend.
- **Stunning UI**: A sleek, dark-mode Next.js interface featuring glassmorphism, Framer Motion queue animations, and a satisfying Before/After image comparison slider.

## 🚀 Architecture

The application is split into two Dockerized microservices:

1. **Frontend (`web/`)**: Next.js 14, TailwindCSS, Framer Motion. Polling-based progress tracking.
2. **Backend (`api/`)**: FastAPI, SQLite, and Python ThreadPoolExecutors. Heavy AI inferences are dispatched to isolated micro-worker scripts (`gfpgan_worker.py`, `realesrgan_worker.py`).

## 🛠️ Quick Start (Docker)

Ensure you have Docker and Docker Compose installed.

```bash
git clone https://github.com/BhavyaKansal20/ChromaCrystal_UHD.git
cd ChromaCrystal_UHD
docker compose up --build -d
```

Access the web interface at `http://localhost:3000`.

## 🧠 Memory Isolation Design

Running multiple Heavy PyTorch models simultaneously traditionally causes a `SIGKILL 137` (Out of Memory) crash in limited Docker environments. 
ChromaCrystal solves this by:
1. **Queuing**: Only one image enters the pipeline at a time.
2. **Subprocess Delegation**: Instead of loading GFPGAN and ESRGAN into the main FastAPI memory, they are instantiated inside temporary subprocesses.
3. **Instant Reclamation**: The moment the upscaler finishes, the subprocess terminates, instantly handing 100% of the memory back to the host machine before the next model is loaded.

## 📦 Dependencies

- **FastAPI** & **Uvicorn**
- **PyTorch**, **Torchvision**
- **OpenCV**
- **DeOldify**, **GFPGAN**, **Real-ESRGAN**
- **Next.js**, **React**, **TailwindCSS**

## 🤝 Contributing
Feel free to open issues and submit Pull Requests! 

---
*Built with ❤️ for restoring history.*
