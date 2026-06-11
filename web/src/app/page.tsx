"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { motion } from "framer-motion";
import { useSession } from "@/context/AuthContext";
import {
  Palette, ScanFace, Maximize, ArrowRight, Sparkles, Zap,
  Shield, Users, Upload, Cpu, Download, LogIn, ChevronDown
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const features = [
  { icon: Palette, title: "AI Colorization", desc: "DeOldify ONNX engine brings vibrant, historically accurate colors to grayscale photos.", color: "purple" },
  { icon: ScanFace, title: "Face Restoration", desc: "GFPGAN restores facial micro-details — eyes, skin texture, and expressions with stunning clarity.", color: "blue" },
  { icon: Maximize, title: "4K Ultra-HD Upscale", desc: "Real-ESRGAN upscales images to crystal-clear 4K resolution with AI-painted smoothness.", color: "cyan" },
  { icon: Users, title: "5-User Concurrency", desc: "Factory Assembly Line architecture handles 5 simultaneous users on a 2-Core Free-Tier CPU.", color: "pink" },
  { icon: Zap, title: "20-Second Execution", desc: "Dynamic Load-Shedding Brain ensures all processing completes in under 20 seconds.", color: "purple" },
  { icon: Shield, title: "Zero Data Storage", desc: "Images are processed in-memory and never stored. Your memories stay private and secure.", color: "blue" },
];

const steps = [
  { icon: Upload, title: "Upload", desc: "Drag & drop your historical photo or click to browse." },
  { icon: Cpu, title: "AI Processing", desc: "3 deep learning models work in sequence to restore your image." },
  { icon: Download, title: "Download", desc: "Get your Ultra-HD masterpiece in seconds." },
];

const iconColors: Record<string, string> = {
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

export default function Home() {
  const { data: session, status: authStatus, signIn } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<number>(4);
  const [colorIntensity, setColorIntensity] = useState<number>(1.0);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(10);
  const [enableColorization, setEnableColorization] = useState<boolean>(true);
  const [enableFaceRestoration, setEnableFaceRestoration] = useState<boolean>(true);
  const [enableUpscaling, setEnableUpscaling] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const handleUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("pending");
    setProgress(0);
    setQueuePosition(null);
    setOriginalUrl(URL.createObjectURL(selectedFile));

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upscale_factor", upscaleFactor.toString());
    formData.append("color_intensity", colorIntensity.toString());
    formData.append("denoise_strength", denoiseStrength.toString());
    formData.append("enable_colorization", enableColorization.toString());
    formData.append("enable_face_restoration", enableFaceRestoration.toString());
    formData.append("enable_upscaling", enableUpscaling.toString());

    try {
      const res = await fetch("/api/v1/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.job_id) {
        setJobId(data.job_id);
        pollStatus(data.job_id);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/status/${id}`);
        const data = await res.json();
        setProgress(data.progress * 100);
        setQueuePosition(data.queue_position);
        if (data.status === "completed") {
          clearInterval(interval);
          setStatus("completed");
          setResultUrl(`/api/v1/download/${id}`);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus("error");
        } else {
          setStatus(data.status);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setStatus("error");
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* ══════════════════════════════════════════════
          SECTION 1: HERO
          ══════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-purple-300 mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by DeOldify · GFPGAN · Real-ESRGAN
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeInUp} custom={1} className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Revive History in{" "}
            <span className="gradient-text">Ultra Reality</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeInUp} custom={2} className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform old, degraded, black-and-white memories into stunning Ultra-HD masterpieces.
            AI-powered colorization, face restoration, and 4K upscaling — all in under 20 seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#restore"
              className="btn-primary px-8 py-3.5 text-base rounded-xl flex items-center gap-2 neon-border"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#features" className="btn-secondary px-8 py-3.5 text-base rounded-xl">
              Learn More
            </a>
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

      {/* ══════════════════════════════════════════════
          SECTION 2: FEATURES
          ══════════════════════════════════════════════ */}
      <section id="features" className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Powered by 3 deep learning models, enterprise architecture, and military-grade optimization.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card glass-card-hover p-6 sm:p-8"
              >
                <div className={`inline-flex p-3 rounded-xl border mb-4 ${iconColors[f.color]}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3: HOW IT WORKS
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Three simple steps to transform your memories.
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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center mb-5 relative z-10">
                  <step.icon className="h-6 w-6 text-purple-300" />
                </div>
                <div className="text-xs font-mono text-purple-400 mb-2">STEP {i + 1}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4: THE APP (Upload / Processing / Result)
          ══════════════════════════════════════════════ */}
      <section id="restore" className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Restoring
            </h2>
            <p className="text-gray-400 text-lg">
              Upload a photo and watch the AI magic unfold.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 sm:p-10"
          >
            {/* Auth Gate */}
            {authStatus === "loading" ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
              </div>
            ) : !session ? (
              <div className="flex flex-col items-center py-12 gap-6">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <Shield className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Sign In to Continue</h3>
                <p className="text-gray-400 text-center max-w-md text-sm leading-relaxed">
                  Create a free account with Google or GitHub to access the AI restoration pipeline.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signIn()}
                  className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 neon-border"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In with Google / GitHub
                </motion.button>
              </div>
            ) : status === "idle" ? (
              <div className="flex flex-col gap-6">
                <UploadDropzone onUpload={handleUpload} />

                {/* Advanced Options Toggle */}
                <div>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSettings ? "rotate-180" : ""}`} />
                    Advanced Options
                  </button>

                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                    >
                      {/* Model toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/[0.06]">
                        {[
                          { label: "Colorize (DeOldify)", checked: enableColorization, set: setEnableColorization },
                          { label: "Restore Faces (GFPGAN)", checked: enableFaceRestoration, set: setEnableFaceRestoration },
                          { label: "Ultra-HD Upscale", checked: enableUpscaling, set: setEnableUpscaling },
                        ].map((toggle) => (
                          <label key={toggle.label} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{toggle.label}</span>
                            <div
                              onClick={() => toggle.set(!toggle.checked)}
                              className={`toggle-switch ${toggle.checked ? "active" : ""}`}
                            />
                          </label>
                        ))}
                      </div>

                      {/* Sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs text-gray-500 font-medium">Upscale Factor</label>
                          <select
                            value={upscaleFactor}
                            onChange={(e) => setUpscaleFactor(Number(e.target.value))}
                            className="glass-input px-3 py-2 text-sm"
                          >
                            <option value={2}>2x (Faster)</option>
                            <option value={4}>4x (Standard HD)</option>
                            <option value={8}>8x (Ultra-HD 4K)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between">
                            <label className="text-xs text-gray-500 font-medium">Color Vibrancy</label>
                            <span className="text-xs text-purple-400 font-mono">{colorIntensity}x</span>
                          </div>
                          <input
                            type="range" min="0.5" max="2.0" step="0.1"
                            value={colorIntensity}
                            onChange={(e) => setColorIntensity(parseFloat(e.target.value))}
                            className="w-full accent-purple-500"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between">
                            <label className="text-xs text-gray-500 font-medium">Denoise</label>
                            <span className="text-xs text-purple-400 font-mono">{denoiseStrength}</span>
                          </div>
                          <input
                            type="range" min="0" max="30" step="1"
                            value={denoiseStrength}
                            onChange={(e) => setDenoiseStrength(parseInt(e.target.value))}
                            className="w-full accent-blue-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Processing State */}
            {(status === "processing" || status === "pending") && (
              <ProcessingOverlay progress={progress} queuePosition={queuePosition} status={status} />
            )}

            {/* Result State */}
            {status === "completed" && originalUrl && resultUrl && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <BeforeAfterSlider original={originalUrl} result={resultUrl} />
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => setStatus("idle")}
                    className="btn-secondary px-6 py-3 rounded-xl text-sm"
                  >
                    Restore Another
                  </button>
                  <a
                    href={resultUrl}
                    download
                    className="btn-primary px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 neon-border"
                  >
                    <Download className="h-4 w-4" />
                    Download Masterpiece
                  </a>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="text-center py-12">
                <p className="text-red-400 text-lg mb-4">An error occurred during restoration.</p>
                <button onClick={() => setStatus("idle")} className="btn-secondary px-6 py-3 rounded-xl text-sm">
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5: CTA
          ══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Your Restoration Journey
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Create your free account and transform old memories into stunning Ultra-HD masterpieces.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!session ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signIn()}
                  className="btn-primary px-8 py-3.5 text-base rounded-xl flex items-center gap-2 neon-border"
                >
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              ) : (
                <a
                  href="#restore"
                  className="btn-primary px-8 py-3.5 text-base rounded-xl flex items-center gap-2 neon-border"
                >
                  Restore a Photo
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
