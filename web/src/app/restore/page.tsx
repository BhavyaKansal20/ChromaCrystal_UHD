"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/context/AuthContext";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Sparkles, Settings, Info, ChevronDown, Lock, RefreshCw, Database
} from "lucide-react";

export default function RestorePage() {
  const { data: session, status: authStatus, setShowAuthModal } = useSession();
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

  // Automatically prompt auth modal if unauthenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      setShowAuthModal(true);
    }
  }, [authStatus]);

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

  if (authStatus === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Validating session...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated" || !session) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8 text-center flex flex-col items-center gap-5 border border-white/[0.08]"
        >
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Access the Ultra-HD photo restoration pipeline. Your files are processed securely in-memory and never stored.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full btn-primary py-3.5 rounded-xl font-semibold text-sm cursor-pointer shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/30"
          >
            Authenticate Account
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 px-4 max-w-4xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <Sparkles className="w-3.5 h-3.5" />
          Workspace Authorized
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Start Restoring</h1>
        <p className="text-gray-400 mt-2 text-sm">Upload a photo to initiate GFPGAN & DeOldify sequences.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-10 border border-white/[0.08]"
      >
        {status === "idle" && (
          <div className="flex flex-col gap-6">
            <UploadDropzone onUpload={handleUpload} />

            {/* Advanced Settings */}
            <div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-semibold cursor-pointer"
              >
                <ChevronDown className={`h-4.5 w-4.5 transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`} />
                Advanced Restoration Controls
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
                  >
                    {/* Model configuration switches */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/[0.06]">
                      {[
                        { label: "AI Colorization (DeOldify)", checked: enableColorization, set: setEnableColorization },
                        { label: "Restore Faces (GFPGAN)", checked: enableFaceRestoration, set: setEnableFaceRestoration },
                        { label: "4K Super Resolution", checked: enableUpscaling, set: setEnableUpscaling },
                      ].map((toggle) => (
                        <label key={toggle.label} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-xs font-semibold text-gray-400 group-hover:text-white transition-colors">{toggle.label}</span>
                          <div
                            onClick={() => toggle.set(!toggle.checked)}
                            className={`toggle-switch ${toggle.checked ? "active" : ""}`}
                          />
                        </label>
                      ))}
                    </div>

                    {/* Fine-Tuning Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Upscale Target</label>
                        <select
                          value={upscaleFactor}
                          onChange={(e) => setUpscaleFactor(Number(e.target.value))}
                          className="glass-input px-3 py-2 text-sm outline-none"
                        >
                          <option value={2}>2x (Faster)</option>
                          <option value={4}>4x (Standard HD)</option>
                          <option value={8}>8x (Ultra-HD 4K)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Saturation Boost</label>
                          <span className="text-xs text-purple-400 font-mono font-bold">{colorIntensity}x</span>
                        </div>
                        <input
                          type="range" min="0.5" max="2.0" step="0.1"
                          value={colorIntensity}
                          onChange={(e) => setColorIntensity(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Denoise Level</label>
                          <span className="text-xs text-blue-400 font-mono font-bold">{denoiseStrength}</span>
                        </div>
                        <input
                          type="range" min="0" max="30" step="1"
                          value={denoiseStrength}
                          onChange={(e) => setDenoiseStrength(parseInt(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(status === "processing" || status === "pending") && (
          <ProcessingOverlay progress={progress} queuePosition={queuePosition} status={status} />
        )}

        {/* Result State */}
        {status === "completed" && originalUrl && resultUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            {/* Database Notice Alert */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3.5 p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm leading-relaxed shadow-[0_0_15px_rgba(6,182,212,0.1)]"
            >
              <Database className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Photo is available in the downloads section. Just go and download!</span>
                This is a temporary database. Restored photos are cached in-memory and auto-purged within 3–5 hours. Please download your files promptly.
              </div>
            </motion.div>

            <BeforeAfterSlider original={originalUrl} result={resultUrl} />

            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setStatus("idle")}
                className="btn-secondary px-6 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Restore Another
              </button>
              <a
                href={resultUrl}
                download={`ChromaCrystal_${file?.name || "restored.jpg"}`}
                className="btn-primary px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/30"
              >
                <Download className="h-4.5 w-4.5" />
                Download Masterpiece
              </a>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center py-12 flex flex-col items-center gap-4">
            <p className="text-red-400 text-lg">An error occurred during restoration.</p>
            <button
              onClick={() => setStatus("idle")}
              className="btn-secondary px-6 py-3 rounded-xl text-sm cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
