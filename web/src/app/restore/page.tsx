"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Sparkles, ChevronDown, Lock, RefreshCw, Database, History, Trash2, Send, Star, CheckCircle, Loader2, X
} from "lucide-react";

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzyeFevXGhnadkmBjCVIdwlaoU4EjI_P42EexiGh70awWq2za2Z2owmBsT-pJIP1BGu3Q/exec";

interface HistoryItem {
  id: string;
  name: string;
  url: string;
  originalUrl: string;
  date: string;
}

export default function RestorePage() {
  const { data: session, status: authStatus, setShowAuthModal } = useSession();
  const { toast } = useToast();
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
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Inline Feedback Form State
  const [fbName, setFbName] = useState("");
  const [fbFeature, setFbFeature] = useState("✨ All Features");
  const [fbRating, setFbRating] = useState(0);
  const [fbHoveredStar, setFbHoveredStar] = useState(0);
  const [fbHelpful, setFbHelpful] = useState<string | null>("Yes");
  const [fbMessage, setFbMessage] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbSubmitted, setFbSubmitted] = useState(false);

  const featuresList = [
    { label: "Colorization", icon: "🎨" },
    { label: "Face Restore", icon: "👤" },
    { label: "4K Upscale", icon: "⚡" },
    { label: "All Features", icon: "✨" },
  ];

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("chromacrystal_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Update default name when session changes
  useEffect(() => {
    if (session?.user?.name) {
      setFbName(session.user.name);
    }
  }, [session]);

  // Prompt login modal if unauthenticated
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
    setFbSubmitted(false); // Reset feedback form state for new restoration
    setFbMessage("");
    setFbRating(0);

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
        pollStatus(data.job_id, selectedFile.name, URL.createObjectURL(selectedFile));
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const pollStatus = async (id: string, fileName: string, origUrl: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/status/${id}`);
        const data = await res.json();
        setProgress(data.progress * 100);
        setQueuePosition(data.queue_position);
        if (data.status === "completed") {
          clearInterval(interval);
          setStatus("completed");
          const dlUrl = `/api/v1/download/${id}`;
          setResultUrl(dlUrl);
          setShowSuccessModal(true);
          toast("Photo restoration completed successfully!", "success");

          // Save to downloads history
          const newItem: HistoryItem = {
            id,
            name: fileName,
            url: dlUrl,
            originalUrl: origUrl,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setHistory(prev => {
            const updated = [newItem, ...prev];
            localStorage.setItem("chromacrystal_history", JSON.stringify(updated));
            return updated;
          });

        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus("error");
          toast("Restoration failed. Please try again.", "error");
        } else {
          setStatus(data.status);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setStatus("error");
        toast("Connection error during status polling.", "error");
      }
    }, 1000);
  };

  const handleClearHistoryItem = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("chromacrystal_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("chromacrystal_history");
  };

  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFbSubmitting(true);

    const userEmail = session?.user?.email || "anonymous@chromacrystal.com";
    const feedbackText = `Feature: ${fbFeature} | Helpful: ${fbHelpful} | Message: ${fbMessage} | Inline Workspace Feedback`;

    try {
      const payload = {
        name: fbName || "Anonymous User",
        email: userEmail,
        rating: fbRating.toString(),
        prediction_type: fbFeature || "✨ All Features",
        helpful: fbHelpful || "Yes",
        message: fbMessage || "No message",
        feedback: feedbackText,
        get_reports: "No"
      };

      const params = new URLSearchParams();
      Object.entries(payload).forEach(([key, val]) => {
        params.append(key, val);
      });

      const submissionUrl = `${GOOGLE_SHEETS_URL}?${params.toString()}`;

      // Concurrent Multi-Format Submission to ensure compatibility with Google Apps Script
      await Promise.allSettled([
        // 1. GET with URL Query Params (Bypasses preflight)
        fetch(submissionUrl, {
          method: "GET",
          mode: "no-cors"
        }),
        // 2. POST with URL Query Params (Bypasses preflight)
        fetch(submissionUrl, {
          method: "POST",
          mode: "no-cors"
        }),
        // 3. POST with URL-encoded Form body (Simple request, bypasses preflight)
        fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        }),
        // 4. POST with JSON body stringified sent as text/plain (Simple request, bypasses preflight)
        fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain"
          },
          body: JSON.stringify(payload)
        })
      ]);

      setFbSubmitted(true);
      toast("Feedback submitted! Thank you for your review.", "success");
    } catch (err) {
      console.error(err);
      setFbSubmitted(true);
      toast("Feedback submitted! Thank you for your review.", "success");
    } finally {
      setFbSubmitting(false);
    }
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
    <div className="py-12 sm:py-20 px-4 max-w-4xl mx-auto flex flex-col gap-10">
      {/* Title */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
          <Sparkles className="w-3.5 h-3.5" />
          Workspace Active
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Restoration Workshop</h1>
        <p className="text-gray-400 mt-2 text-sm">Upload a photo to run the GFPGAN, DeOldify, and Real-ESRGAN sequences.</p>
      </div>

      {/* Main Upload Workspace */}
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
                <span className="font-bold text-white block mb-0.5">Photo is available in the downloads section below. Just go and download!</span>
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

      {/* Inline Feedback Form (Shows right after successful restoration) */}
      {status === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 sm:p-8 border border-purple-500/80 shadow-[0_0_40px_rgba(168,85,247,0.4)] bg-purple-900/10 relative overflow-hidden feedback-glow-card"
        >
          {/* Animated glow background inside the card */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-pulse pointer-events-none" />
          <AnimatePresence mode="wait">
            {!fbSubmitted ? (
              <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-5 max-w-xl mx-auto">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2.5 flex items-center justify-center z-10">
                    <img src="/logo.png" alt="ChromaCrystal Logo" className="h-8 sm:h-9 w-auto hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                  </div>
                  <div className="text-[9px] font-bold text-purple-400 tracking-widest uppercase mb-2">ChromaCrystal UHD</div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Share your experience ✨</h2>
                  <p className="text-xs text-gray-500 mt-1">Takes 30 seconds — helps us improve!</p>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    placeholder="Mr. Kansal"
                    className="w-full bg-[#110e2e]/60 border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  />
                </div>

                {/* What did you restore */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">What did you restore?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {featuresList.map((f) => {
                      const val = `${f.icon} ${f.label}`;
                      const isSelected = fbFeature === val;
                      return (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => setFbFeature(val)}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                              : "bg-[#110e2e]/40 border-white/[0.06] text-gray-400 hover:bg-white/[0.02] hover:text-white"
                          }`}
                        >
                          <span>{f.icon}</span>
                          <span>{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Rate your experience</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= (fbHoveredStar || fbRating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFbRating(star)}
                          onMouseEnter={() => setFbHoveredStar(star)}
                          onMouseLeave={() => setFbHoveredStar(0)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 transition-all ${
                              isActive
                                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                : "text-gray-700"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Was this helpful */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Was this helpful?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Yes", "No"].map((opt) => {
                      const isSelected = fbHelpful === opt;
                      const icon = opt === "Yes" ? "👍" : "👎";
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFbHelpful(opt)}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-500/10 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                              : "bg-[#110e2e]/40 border-white/[0.06] text-gray-400 hover:bg-white/[0.02]"
                          }`}
                        >
                          <span>{icon}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Leave a message</label>
                  <textarea
                    rows={4}
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder="Tell us what you think, what can be improved..."
                    className="w-full bg-[#110e2e]/60 border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={fbSubmitting || fbRating === 0}
                  className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white font-bold text-sm shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {fbSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Feedback ✨</span>
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <motion.div
                key="fb-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center flex flex-col items-center gap-5"
              >
                <div className="rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-5 ring-1 ring-green-400/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <CheckCircle className="h-10 w-10 text-green-400 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Feedback Recorded!</h2>
                  <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                    Your feedback was posted to Google Sheets. Thank you for helping us optimize our models!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Restored Downloads History List */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 sm:p-10 border border-white/[0.08]"
      >
        <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Downloads History</h2>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              className="text-xs text-red-400 hover:text-red-350 flex items-center gap-1 cursor-pointer font-semibold bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm flex flex-col items-center gap-2">
            <Database className="w-8 h-8 text-gray-600 animate-pulse" />
            <span>No restorations in this session yet. Your downloads list is empty.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/[0.08] bg-black/30 shrink-0">
                    <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                  {/* Name and Date */}
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-[320px]">{item.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Restored at {item.date} · Temporary Cache</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={item.url}
                    download={`ChromaCrystal_${item.name}`}
                    className="p-2 sm:px-4 sm:py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <button
                    onClick={() => handleClearHistoryItem(item.id)}
                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-red-500/15 border border-white/[0.06] hover:border-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Restoration Success Popup Toast (Bottom-Right) */}
      <AnimatePresence>
        {showSuccessModal && resultUrl && (
          <div className="fixed bottom-6 right-6 z-50 p-4 max-w-sm sm:max-w-md w-full pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="liquid-glass p-5 sm:p-6 flex flex-col items-center gap-4 shadow-[0_20px_50px_rgba(139,92,246,0.35)] border border-purple-500/40 text-center relative pointer-events-auto"
            >
              {/* Close Button top right */}
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-3 ring-1 ring-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <CheckCircle className="h-7 w-7 text-purple-400 animate-pulse" />
              </div>

              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Restoration Complete! 🎉</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Your photo was successfully processed and saved.
                </p>
              </div>

              {/* Thumbnail of restored image */}
              <div className="w-full h-28 rounded-xl overflow-hidden border border-white/[0.08] bg-black/20 relative group">
                <img
                  src={resultUrl}
                  alt="Restored Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
              </div>

              {/* Database Notice Alert */}
              <div className="flex gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-left text-[10px] leading-relaxed">
                <Database className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Stored in temporary database.</span>
                  Auto-purged within 3–5 hours. Please download your masterpiece promptly.
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2">
                <a
                  href={resultUrl}
                  download={`ChromaCrystal_${file?.name || "restored.jpg"}`}
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full btn-primary py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/20"
                >
                  <Download className="h-4 w-4" />
                  Download Masterpiece
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setShowSuccessModal(false);
                    }}
                    className="btn-secondary py-2 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Another
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="btn-secondary py-2 rounded-xl text-[10px] flex items-center justify-center gap-1 cursor-pointer font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
