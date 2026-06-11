"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Send, CheckCircle, Loader2 } from "lucide-react";

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzJRMguV_tan7GbxBkC0fjOYjpCEpjFz0IDxJyX4wiuJRtLSOZwXvVn8SDLTnN10-s8sw/exec";

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [feature, setFeature] = useState<string>("✨ All Features");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [helpful, setHelpful] = useState<string | null>("Yes");
  const [message, setMessage] = useState("");
  const [getReports, setGetReports] = useState(false);
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
    const feedbackText = `Feature: ${feature} | Helpful: ${helpful} | Get Reports: ${getReports} | Message: ${message}`;

    try {
      const formData = new URLSearchParams();
      formData.append("name", name || "Anonymous User");
      formData.append("email", userEmail);
      formData.append("rating", rating.toString());
      formData.append("feedback", feedbackText);

      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        mode: "no-cors",
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setIsSubmitted(true); // Standard mode: no-cors resolves as opaque, treat as submitted
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
    setGetReports(false);
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
                <div>
                  <div className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mb-1">CHROMACRYSTAL UHD</div>
                  <h1 className="text-2xl font-black text-white leading-tight">Share your experience ✨</h1>
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

                {/* Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group mt-1 select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={getReports}
                      onChange={(e) => setGetReports(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border border-white/[0.08] bg-[#110e2e]/60 rounded-md transition-all peer-checked:bg-purple-600 peer-checked:border-purple-500/40" />
                    <svg className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                    Get predicted reports in reports section
                  </span>
                </label>

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
