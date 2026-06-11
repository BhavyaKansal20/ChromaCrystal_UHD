"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Send, CheckCircle, Loader2 } from "lucide-react";

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/PLACEHOLDER/exec";

const inputClasses = "w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all duration-200";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("rating", rating.toString());
      formData.append("feedback", feedback);
      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        mode: "no-cors",
      });
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName(""); setEmail(""); setRating(0); setHoveredStar(0); setFeedback(""); setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-purple-400">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div className="mb-8 text-center">
                  <h1 className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">Share Your Experience ✨</h1>
                  <p className="mt-3 text-gray-400">Takes 30 seconds — helps us improve!</p>
                </div>

                <div className="mb-8 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className={inputClasses} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClasses} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <label className="mb-3 block text-sm font-medium text-gray-300">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= (hoveredStar || rating);
                        return (
                          <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} className="group rounded-lg p-1 transition-transform duration-150 hover:scale-110 focus:outline-none">
                            <Star className={`h-8 w-8 transition-all duration-200 ${isActive ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "text-gray-600 group-hover:text-yellow-400/50"}`} />
                          </button>
                        );
                      })}
                      {rating > 0 && <span className="ml-2 text-sm text-gray-400">{rating}/5</span>}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <label htmlFor="feedback" className="mb-2 block text-sm font-medium text-gray-300">Feedback</label>
                    <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Tell us what you loved, or what we can do better..." rows={4} required className={`${inputClasses} resize-none`} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <button type="submit" disabled={isSubmitting || rating === 0} className="group relative w-full overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>) : (<><Send className="h-4 w-4" /> Submit Feedback</>)}
                      </span>
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className="py-10 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }} className="mb-6 flex justify-center">
                  <div className="rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-5 ring-1 ring-green-400/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-3 text-2xl font-bold text-white">Thank you!</motion.h2>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mx-auto max-w-sm text-gray-400">Your feedback has been recorded. It means a lot and helps us build better! 💪</motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-8">
                  <button onClick={handleReset} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:border-purple-500/40 hover:bg-white/[0.08] hover:text-white">Submit Another</button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
