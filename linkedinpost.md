# 🚀 VIRAL LINKEDIN POST: ChromaCrystal UHD Full-Stack Update!

*Copy the section below to publish your LinkedIn Post.*

***

**Can a Free-Tier CPU with only 2 cores run 3 massive, memory-heavy Deep Learning models simultaneously without crashing?**

Most engineers would say it’s mathematically impossible. But as a B.Tech 2nd-year student at **Thapar Institute of Engineering & Technology (TIET), Patiala**, I took that as a personal challenge. 

I’m thrilled to share the release of **ChromaCrystal UHD v2.0**—which I have scaled from a simple AI proof-of-concept into a full-stack, production-grade, 60 FPS web application! 📸✨💎

---

### 🚨 The Core Challenge:
Running **DeOldify (ONNX)**, **GFPGAN (PyTorch)**, and **Real-ESRGAN (x4 AI engine)** together easily consumes massive RAM and CPU cycles. Initially, concurrent user requests caused instant Out-of-Memory (OOM) crashes and 3-minute queues on the free-tier server.

To solve this, I had to redesign the architecture and apply low-level systems engineering:

### 🛠️ How I Engineered the Solution:
1. 🔒 **The Factory Assembly Line (Mutex Thread Locks):** To prevent multiple requests from colliding and causing "tensor bleeding" (where one image's colors bled into another), I isolated the models using Python Mutex Locks (`threading.Lock()`). This guarantees perfect output colors for every user.
2. 🧠 **Dynamic Load-Shedding (Hyper-Speed Mode):** When server traffic spikes (3+ users), the server dynamically engages Hyper-Speed Mode. It mathematically shrinks base images to 256px before processing, dropping calculations by 60% and completing inferences in **2.5 seconds**!
3. 🌐 **Async Event-Loop Bypass:** Re-architected network endpoints into Asynchronous Coroutines (`async def`). Browser heartbeat pings are answered in 0.001ms, preventing ghost-cancels when the CPU is at 100% load.
4. 🌌 **Next.js 14 App Router & 60 FPS Client:** Migrated the frontend to Next.js 14, TypeScript, and TailwindCSS. I removed heavy real-time SVG HUD charts that bottlenecked browser rendering, securing a buttery-smooth 60 FPS UI.
5. 📋 **CORS Preflight-Free Telemetry Database:** Connected a Google Sheets database that concurrently tracks feedback and ratings. Bypassed browser CORS preflight limitations (OPTIONS requests) by using simplified request body formats (`text/plain` and url-encoded headers) posted straight to Google Apps Script.

---

### 📈 The Concurrency Proof:
We stress-tested the app with **20 concurrent users**. Because of the sequential mutex queuing, the server **never crashed**. It handled the load flawlessly, scaling the response queue safely while maintaining absolute system stability.

This project has been an incredible masterclass in systems optimization, memory management, and full-stack architecture.

I would love to get your feedback on the live app!

👉 **Try it Live on Hugging Face:** https://lnkd.in/g2ygb4vM 
💻 **Explore the Code on GitHub:** https://lnkd.in/gZa9BHgq
📄 **Read the Deep-Dive Case Study:** https://github.com/BhavyaKansal20/ChromaCrystal_UHD/blob/main/CASE_STUDY.md

To the senior engineers, builders, and recruiters in my network: What would you have optimized differently? I'd love to discuss in the comments below! 👇

#ArtificialIntelligence #MachineLearning #ComputerVision #SoftwareEngineering #NextJS #FastAPI #DeveloperJourney #WebDevelopment #TechInnovation #ThaparUniversity #TIETPatiala #FullStackAI

***

## 📸 Recommended Screenshots & Visuals to Attach:
To maximize engagement, attach **3 to 4 high-quality screenshots** in a gallery format:

1. **Screenshot 1: The Before/After Restoration Lab (The "Hero" Image)**
   - **What to show:** A vintage historical photo loaded in the workspace, with the comparison slider pulled halfway across the screen showing the black-and-white scratches on the left and the colorized, sharp 4K details on the right.
   - **Why:** This instantly demonstrates the power and utility of the app at first glance.
2. **Screenshot 2: The Futuristic Dark-Mode Landing Page**
   - **What to show:** The clean, premium landing page showing the massive 3D crystal centerpiece logo, drifting neon background orbs, and the glowing "Restore Your Photos Now" CTA button.
   - **Why:** Shows off your premium UI/UX design skills.
3. **Screenshot 3: The Centered Auth Modal in Action**
   - **What to show:** The beautiful glassmorphism "Welcome Back" login modal with the Google/GitHub login buttons popping up on the screen with the blurred background.
   - **Why:** Highlights the security, Next.js routing, and clean modal layout.
4. **Screenshot 4: The Star-Rating Feedback Page**
   - **What to show:** The feedback form showing a 5-star rating, with the features dropdown and the message section ready to submit.
   - **Why:** Proves that the app is fully interactive, gathers user feedback, and connects to a Google Sheets database.
