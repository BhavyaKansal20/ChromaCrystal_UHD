"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundTelemetry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouse, setMouse] = useState({ targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        targetX: e.clientX,
        targetY: e.clientY
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
    <canvas ref={canvasRef} className="fixed inset-0 -z-20 pointer-events-none w-full h-full" />
  );
}
