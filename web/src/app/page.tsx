"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Cpu, Upload, Download, ChevronDown } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const steps = [
  { icon: Upload, title: "Upload Image", desc: "Drag & drop your historical photo or select it from your device." },
  { icon: Cpu, title: "AI Sequence", desc: "DeOldify, GFPGAN, and Real-ESRGAN sequence runs in parallel threadpools." },
  { icon: Download, title: "Download HD", desc: "Acquire your 4K restored masterpiece within 20 seconds." },
];

export default function Home() {
  const { data: session, setShowAuthModal } = useSession();
  const router = useRouter();

  // Redirect to restore dashboard if session becomes active
  useEffect(() => {
    if (session) {
      router.push("/restore");
    }
  }, [session, router]);

  const handleCTA = () => {
    if (session) {
      router.push("/restore");
    } else {
      setShowAuthModal(true);
    }
  };


  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-semibold text-purple-300 mb-8 shadow-[0_0_15px_rgba(168,85,247,0.15)] border border-white/[0.05]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Colorization · Face Restore · 4K Upscale
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            custom={1}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
          >
            Revive History in{" "}
            <span className="gradient-text">Ultra Reality</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            custom={2}
            className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Transform old, damaged, black-and-white family memories into stunning Ultra-HD masterpieces. 
            Powered by next-gen neural network sequencing — processed securely in-memory.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleCTA}
              className="btn-primary px-8 py-3.5 text-base rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/30"
            >
              Restore Your Photos Now
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => router.push("/features")}
              className="btn-secondary px-8 py-3.5 text-base rounded-xl cursor-pointer"
            >
              Examine Features
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="h-5 w-5 text-gray-600 animate-bounce" />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-[#030014] to-[#05021a]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Restoration Sequence
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Three modular neural pathways running in synchronous orchestration.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center mb-5 relative z-10 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <step.icon className="h-6 w-6 text-purple-300" />
                </div>
                <div className="text-[10px] font-bold font-mono text-purple-400 mb-2 uppercase tracking-wider">SEQUENCE PHASE 0{i + 1}</div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemetry Dashboard Widget Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#030014] to-[#05021a] relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Cpu className="w-3.5 h-3.5" />
              Live Telemetry
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">System Metrics Dashboard</h2>
            <p className="text-gray-400 mt-2 text-sm">Real-time status of the PyTorch and ONNX sub-worker pools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Widget 1: CPU/VRAM Allocation */}
            <div className="liquid-glass p-6 border border-purple-500/25 shadow-[0_0_20px_rgba(139,92,246,0.1)] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-black uppercase text-purple-300 tracking-wider">💾 Memory Allocation</span>
                <span className="text-[10px] text-purple-400 font-mono">100% RECLAIMED</span>
              </div>
              <div className="flex flex-col gap-3 font-mono text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>GFPGAN subprocess</span>
                  <span className="text-white">512MB VRAM</span>
                </div>
                <div className="flex justify-between">
                  <span>DeOldify subprocess</span>
                  <span className="text-white">1.2GB VRAM</span>
                </div>
                <div className="flex justify-between">
                  <span>Real-ESRGAN (4K)</span>
                  <span className="text-white">840MB VRAM</span>
                </div>
                <div className="w-full bg-white/[0.05] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full w-[35%] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Widget 2: Thread Pool Monitor */}
            <div className="liquid-glass p-6 border border-cyan-500/25 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-black uppercase text-cyan-300 tracking-wider">⚡ Thread Pool Monitor</span>
                <span className="text-[10px] text-emerald-400 font-mono">ACTIVE (4/4)</span>
              </div>
              <div className="flex flex-col gap-3 font-mono text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Worker Thread 01</span>
                  <span className="text-emerald-400">Executing</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker Thread 02</span>
                  <span className="text-emerald-400">Executing</span>
                </div>
                <div className="flex justify-between">
                  <span>Worker Thread 03</span>
                  <span className="text-gray-500">Idle</span>
                </div>
                <div className="flex justify-between">
                  <span>Heartbeat sweeper</span>
                  <span className="text-cyan-400">Active</span>
                </div>
              </div>
            </div>

            {/* Widget 3: Task Queue Metrics */}
            <div className="liquid-glass p-6 border border-pink-500/25 shadow-[0_0_20px_rgba(236,72,153,0.1)] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-xs font-black uppercase text-pink-300 tracking-wider">📦 SQLite Task Queue</span>
                <span className="text-[10px] text-pink-400 font-mono">Healthy</span>
              </div>
              <div className="flex flex-col gap-3 font-mono text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Concurrent Slots</span>
                  <span className="text-white">5 / 5 active</span>
                </div>
                <div className="flex justify-between">
                  <span>Queue Mutex Lock</span>
                  <span className="text-emerald-400">Unlocked</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Jobs</span>
                  <span className="text-white">1,842</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Process Time</span>
                  <span className="text-white">16.4s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#05021a] to-[#030014]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 border border-white/[0.08] relative overflow-hidden"
          >
            <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl" />

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 relative z-10 leading-tight">
              Begin Restoration Journey
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed relative z-10">
              Create a free account to gain full access to colorization, face restoration, and 4K upscaling.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button
                onClick={handleCTA}
                className="btn-primary px-8 py-3.5 text-base rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/30"
              >
                {session ? "Enter Restoration Lab" : "Register Free Account"}
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
