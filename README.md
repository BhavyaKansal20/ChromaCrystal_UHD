<div align="center">

<br>

```
 ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ███╗ █████╗ 
██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗ ████║██╔══██╗
██║     ███████║██████╔╝██║   ██║██╔████╔██║███████║
██║     ██╔══██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║
╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝
 
 ██████╗██████╗ ██╗   ██╗███████╗████████╗ █████╗ ██╗     
██╔════╝██╔══██╗╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔══██╗██║     
██║     ██████╔╝ ╚████╔╝ ███████╗   ██║   ███████║██║     
██║     ██╔══██╗  ╚██╔╝  ╚════██║   ██║   ██╔══██║██║     
╚██████╗██║  ██║   ██║   ███████║   ██║   ██║  ██║███████╗
 ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
```

### ✦ Advanced ML-Powered Image Restoration Platform ✦
#### Transform Black & White Memories Into Ultra-HD Reality — Powered by AI

<br>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Localhost-06d6a0?style=for-the-badge&labelColor=0d1117)](http://localhost:3000)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-Image%20Processing-5C3EE8?style=flat-square&logo=opencv&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)

<br>

> **"Reviving History in Ultra Reality. No blurry edges. No unnatural colors."**

</div>

---

<br>

## ⚡ At a Glance

<div align="center">

| 🎨 Cinematic Colorization | 🧠 Facial Restoration | 🔍 Ultra-HD Upscaling | 📸 Scratch & Noise Removal | ⚙️ Customization |
|:---:|:---:|:---:|:---:|:---:|
| Lab Color Space | GFPGAN | Real-ESRGAN | OpenCV NLMeans | UI Sliders |
| Adaptive Mapping | High-Fidelity Details | Up to 8x Resolution | Configurable Strength | Real-time Config |
| Preserves Texture | Seamless Blending | Sharp Edges | Preserves Grain | Full Control |

</div>

---

<br>

## 🏗️ System Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    💎  CHROMA CRYSTAL UHD  —  ARCHITECTURE                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌─────────────┐     HTTP       ┌──────────────────────────────────────┐   ║
║   │   🌐 USER   │ ─────────────► │          NEXT.JS FRONTEND            │   ║
║   │   BROWSER   │                │                                      │   ║
║   └─────────────┘                │  ┌────────────┐  ┌────────────────┐  │   ║
║                                  │  │  Dropzone  │  │   UI Sliders   │  │   ║
║   ┌─────────────┐                │  │  Component │  │  (Custom Auth) │  │   ║
║   │  📱 MOBILE  │ ─────────────► │  │  (Next.js) │  │  /BeforeAfter  │  │   ║
║   │             │                │  └────────────┘  │  /Processing   │  │   ║
║   └─────────────┘                │                  └────────────────┘  │   ║
║                                  └──────────────┬───────────────────────┘   ║
║                                                 │                            ║
║              ┌──────────────────────────────────┼──────────────────────┐    ║
║              │                                  │                      │    ║
║              ▼                                  ▼                      ▼    ║
║   ┌──────────────────┐             ┌─────────────────┐     ┌────────────────┐║
║   │  🧠 ML ENGINE    │             │  🗄️  SQLITE DB  │     │  🚀 FAST API   │║
║   │                  │             │                 │     │                │║
║   │  RealESRGAN.pth  │             │  image_jobs     │     │  /v1/upload    │║
║   │  GFPGAN.pth      │             │  tracking ID    │     │  /v1/status    │║
║   │  OpenCV Core     │             │  job progress   │     │  /v1/download  │║
║   └──────────────────┘             └─────────────────┘     └────────────────┘║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

<br>

## 🤖 AI Pipeline

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         ML PIPELINE — END TO END                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   RAW IMAGE               PREPROCESSING            RESTORATION               ║
║  ──────────              ───────────────          ────────────────           ║
║  Vintage B&W  ────────►  NLMeans Denoising ─────► CLAHE Contrast Eq.         ║
║  Scratched               Configurable Lvl         (L-Channel Lab Space)      ║
║                                                                              ║
║                                                                              ║
║              OUTPUT                   UPSCALING          COLORIZATION        ║
║             ────────────            ──────────          ─────────────        ║
║             Final JPEG ◄──────────  Real-ESRGAN ◄─────  HSV Vibrancy Boost   ║
║             Ultra-HD                (Configurable x2/x4/x8)                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

<br>

## ✨ Features

<details>
<summary><b>🎨 Cinematic Colorization</b> — click to expand</summary>

<br>

Dynamically detects grayscale images and applies an intelligent bone colormap combined with advanced adaptive histogram equalization (CLAHE) on the LAB color space.

**Customization:**
Users can control the *Color Vibrancy* multiplier via the UI to go from a muted, historically accurate look to a fully vibrant modern cinematic look.
</details>

<details>
<summary><b>🔍 Ultra-HD Upscaling</b> — click to expand</summary>

<br>

Leverages **Real-ESRGAN** (Real-Enhanced Super-Resolution Generative Adversarial Networks) to intelligently rebuild missing pixels.

**Customization:**
- `2x` — Faster, standard enhancement.
- `4x` — High Definition (Default).
- `8x` — Ultra-HD 4K quality for massive displays.
</details>

<details>
<summary><b>🧠 Facial Texture Restoration</b> — click to expand</summary>

<br>

Uses **GFPGAN** (Generative Facial Prior GAN) to specifically target and rebuild heavily damaged facial features (eyes, teeth, skin texture) that generic upscalers fail on.
</details>

<details>
<summary><b>📸 Scratch & Noise Removal</b> — click to expand</summary>

<br>

Employs Non-Local Means (NLMeans) Denoising to surgically remove dust and scratches without blurring the underlying subject.

**Customization:**
Users can slide the denoise strength to either preserve historical grain or achieve a completely smooth, modern aesthetic.
</details>


---

<br>

## ⚙️ Setup & Run Locally

### Prerequisites

```bash
docker --version
docker-compose --version
```

### Step 1 — Clone

```bash
git clone https://github.com/BhavyaKansal20/chromacrystal-uhd.git
cd chromacrystal-uhd
```

### Step 2 — Launch with Docker Compose

This platform is heavily optimized for containerized deployment to avoid dependency hell with complex ML graphical libraries.

```bash
docker compose up --build
```

### Step 3 — Access

- **Frontend Application:** `http://localhost:3000`
- **Backend API Docs:** `http://localhost:8000/docs`

---

<br>

## 🧰 Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:--|:--|:--|
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | Asynchronous API routing |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) | React UI Framework |
| **Styling** | ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Premium Glassmorphism UI |
| **ML Engine** | ![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) | ESRGAN & GFPGAN processing |
| **CV Engine** | ![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white) | Color space matrix operations |
| **Database** | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) | Tracking asynchronous jobs |
| **Infra** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) | Isolated deployment |

</div>

---

<br>

## 👨💻 Author

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   👤  Bhavya Kansal                                          ║
║   🎓  AI Engineer | DeepTech Developer                       ║
║   🏢  Founder — MultiModex AI                                ║
║   🎓  B.Tech AI & ML — Thapar Institute of Engg. & Tech      ║
║   🔬  AI/ML Intern Trainee — IIT Ropar × NIELIT              ║
║   🌐  bhavyakansal.dev                                       ║
║   📧  kansalbhavya27@gmail.com                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

[![Portfolio](https://img.shields.io/badge/🌐%20Portfolio-bhavyakansal.dev-06d6a0?style=for-the-badge&labelColor=0d1117)](https://bhavyakansal.dev)
[![GitHub](https://img.shields.io/badge/GitHub-BhavyaKansal20-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/BhavyaKansal20)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kansal0920-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kansal0920)

</div>

---

<div align="center">

<br>

```
  ╔══════════════════════════════════════════════════════╗
  ║     💎  C H R O M A   C R Y S T A L   U H D         ║
  ║     MultiModex AI  •  © 2026 Bhavya Kansal           ║
  ║     Built with ❤️  for preserving memories          ║
  ╚══════════════════════════════════════════════════════╝
```

</div>
# ChromaCrystal_UHD
