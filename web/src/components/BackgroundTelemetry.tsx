"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundTelemetry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [cpuLoad, setCpuLoad] = useState(12.4);
  const [vramAlloc, setVramAlloc] = useState(2.56);
  const [ping, setPing] = useState(8);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse(prev => ({
        ...prev,
        targetX: e.clientX,
        targetY: e.clientY
      }));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Telemetry random fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(prev => Math.max(5.0, Math.min(25.0, Number((prev + (Math.random() - 0.5) * 3).toFixed(1)))));
      setVramAlloc(prev => Math.max(2.4, Math.min(2.8, Number((prev + (Math.random() - 0.5) * 0.05).toFixed(2)))));
      setPing(prev => Math.max(5, Math.min(12, Math.floor(prev + (Math.random() - 0.5) * 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particles array
    const particleCount = 45;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colors = ["rgba(139, 92, 246, 0.12)", "rgba(59, 130, 246, 0.12)", "rgba(6, 182, 212, 0.12)"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let currentMouseX = 0;
    let currentMouseY = 0;

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinates
      currentMouseX += (mouse.targetX - currentMouseX) * 0.08;
      currentMouseY += (mouse.targetY - currentMouseY) * 0.08;

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.06;
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Drag towards mouse if close
        const distToMouse = Math.hypot(p.x - currentMouseX, p.y - currentMouseY);
        if (distToMouse < 200) {
          const force = (200 - distToMouse) / 2000;
          p.vx += (currentMouseX - p.x) * force * 0.05;
          p.vy += (currentMouseY - p.y) * force * 0.05;

          // Cap speed
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > 1.2) {
            p.vx = (p.vx / speed) * 1.2;
            p.vy = (p.vy / speed) * 1.2;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mouse.targetX, mouse.targetY]);

  return (
    <>
      {/* Interactive canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 -z-20 pointer-events-none w-full h-full" />

      {/* Holographic HUD Cyber-Widgets (z-index -15, low opacity 0.06) */}
      <div className="fixed inset-0 -z-15 pointer-events-none select-none overflow-hidden opacity-[0.06] text-white font-mono text-[9px]">
        {/* Top Left: Coordinate grid & scan indicator */}
        <div className="absolute top-28 left-6 flex flex-col gap-1 border-l border-t border-purple-500/30 p-2.5 max-w-[150px]">
          <div className="flex items-center gap-1.5 text-purple-400 font-bold">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
            <span>SYS_COORD_TRK</span>
          </div>
          <div>LOC_X: {mouse.targetX}px</div>
          <div>LOC_Y: {mouse.targetY}px</div>
          <div>GRID_REF: CC-UHD-4K</div>
        </div>

        {/* Top Right: CPU Load & Core usage */}
        <div className="absolute top-28 right-6 flex flex-col gap-1 border-r border-t border-cyan-500/30 p-2.5 max-w-[160px] text-right items-end">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span>CORE_THREAD_MTRX</span>
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          </div>
          <div>PYTORCH_VRAM: {vramAlloc} GB</div>
          <div>CPU_ALLOC: {cpuLoad}%</div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-1.5 h-3 border border-cyan-500/40 ${
                  i <= Math.ceil(cpuLoad / 6) ? "bg-cyan-500/50" : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Left: SQLite Transaction logs */}
        <div className="absolute bottom-28 left-6 flex flex-col gap-1 border-l border-b border-pink-500/30 p-2.5 max-w-[180px]">
          <div className="text-pink-400 font-bold">SQLITE_MUTEX_QUEUE</div>
          <div className="truncate w-full text-gray-500">[06:31:02] INFERENCE_WAITING</div>
          <div className="truncate w-full text-gray-400">[06:31:04] LOCK_MUTEX_ACQUIRED</div>
          <div className="truncate w-full text-pink-300">[06:31:05] MEM_CLEAN_SUCCESS</div>
        </div>

        {/* Bottom Right: Latency & System Status */}
        <div className="absolute bottom-28 right-6 flex flex-col gap-1 border-r border-b border-purple-500/30 p-2.5 max-w-[150px] text-right">
          <div className="text-purple-400 font-bold">NET_HEARTBEAT</div>
          <div>GATEWAY_PING: {ping}ms</div>
          <div>SOCKET_STATE: ESTABLISHED</div>
          <div>SYSTEM_UPTIME: 18,390s</div>
        </div>
      </div>
    </>
  );
}
