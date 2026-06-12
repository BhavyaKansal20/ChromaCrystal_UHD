"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Send, CheckCircle, Loader2 } from "lucide-react";

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzyeFevXGhnadkmBjCVIdwlaoU4EjI_P42EexiGh70awWq2za2Z2owmBsT-pJIP1BGu3Q/exec";

export default function FeedbackPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState(session?.user?.name || "");
  const [feature, setFeature] = useState<string>("✨ All Features");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [helpful, setHelpful] = useState<string | null>("Yes");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const featuresList = [
    { label: "Colorization", icon: "🎨" },
    { label: "Face Restore", icon: "👤" },
    { label: "4K Upscale", icon: "⚡" },
    { label: "All Features", icon: "✨" },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userEmail = session?.user?.email || "anonymous@chromacrystal.com";
    const feedbackText = `Feature: ${feature} | Helpful: ${helpful} | Message: ${message}`;

    try {
      const payload = {
        name: name || "Anonymous User",
        email: userEmail,
        rating: rating.toString(),
        prediction_type: feature || "✨ All Features",
        helpful: helpful || "Yes",
        message: message || "No message",
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

      setIsSubmitted(true);
      toast("Feedback submitted! Thank you for your review.", "success");
    } catch (err) {
      console.error(err);
      setIsSubmitted(true); // Treat as submitted (no-cors mode)
      toast("Feedback submitted! Thank you for your review.", "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName(session?.user?.name || "");
    setFeature("✨ All Features");
    setRating(0);
    setHoveredStar(0);
    setHelpful("Yes");
    setMessage("");
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-[90vh] px-4 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-[480px]">
        {/* Back navigation */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/" className="group inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-purple-400 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0b0820]/85 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
        >
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2.5 flex items-center justify-center">
                    <img src="/logo.png" alt="ChromaCrystal Logo" className="h-8 sm:h-9 w-auto hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.25)]" />
                  </div>
                  <div className="text-[9px] font-bold text-purple-400 tracking-widest uppercase mb-2">ChromaCrystal UHD</div>
                  <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">Share your experience ✨</h1>
                  <p className="text-xs text-gray-500 mt-1">Takes 30 seconds — helps us improve!</p>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mr. Kansal"
                    className="w-full bg-[#110e2e]/60 border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  />
                </div>

                {/* Feature selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">What did you restore?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {featuresList.map((f) => {
                      const value = `${f.icon} ${f.label}`;
                      const isSelected = feature === value;
                      return (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => setFeature(value)}
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
                      const isActive = star <= (hoveredStar || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
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

                {/* Helpful */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Was this helpful?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["Yes", "No"].map((opt) => {
                      const isSelected = helpful === opt;
                      const icon = opt === "Yes" ? "👍" : "👎";
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setHelpful(opt)}
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think, what can be improved..."
                    className="w-full bg-[#110e2e]/60 border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-110 text-white font-bold text-sm shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
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
                key="success"
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
                    Thank you for your valuable response. We will use it to optimize our GFPGAN and DeOldify processing sequences.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-2 btn-secondary px-6 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Submit Another response
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
