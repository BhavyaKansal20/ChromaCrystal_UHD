"use client";

import { useState } from "react";
import { useSession } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Sparkles, LogIn, AlertCircle } from "lucide-react";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signInWithEmail, signUpWithEmail } = useSession();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    try {
      await signIn(provider);
      toast(`Successfully signed in with ${provider === "google" ? "Google" : "GitHub"}!`, "success");
    } catch (err: any) {
      const msg = err.message || "Failed to sign in.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
        toast("Successfully signed in!", "success");
      } else {
        if (!name) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        await signUpWithEmail(name, email, password);
        toast("Account created successfully!", "success");
      }
    } catch (err: any) {
      let friendlyMessage = err.message;
      if (err.code === "auth/invalid-credential") {
        friendlyMessage = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      }
      setError(friendlyMessage);
      toast(friendlyMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <>
          {/* Transparent Backdrop to close on click outside */}
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={handleClose} />

          {/* Floating Auth Card Toast (Bottom-Right) */}
          <div className="fixed bottom-6 right-6 z-50 p-4 max-w-sm sm:max-w-[400px] w-full pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="liquid-glass w-full p-6 sm:p-7 shadow-[0_20px_50px_rgba(139,92,246,0.35)] border border-purple-500/40 flex flex-col gap-5 pointer-events-auto relative"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Logo / Header */}
              <div className="flex flex-col items-center text-center mt-1">
                <div className="relative mb-2.5 flex items-center justify-center">
                  <img src="/logo.png" alt="ChromaCrystal Logo" className="h-10 sm:h-11 w-auto hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.25)]" />
                </div>
                <div className="text-[9px] font-bold text-purple-400 tracking-widest uppercase mb-2">ChromaCrystal UHD</div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {mode === "signin" ? "Welcome Back" : "Create Account"}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {mode === "signin" ? "Sign in to your ChromaCrystal account" : "Join ChromaCrystal for free"}
                </p>
              </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bhavya Kansal"
                    className="w-full bg-[#110e2e]/60 border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#110e2e]/60 border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#110e2e]/60 border border-white/[0.08] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer ${
                mode === "signin"
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:bg-purple-500 border border-purple-500/30"
                  : "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 border border-cyan-400/30"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === "signin" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </motion.button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center my-1">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] font-bold text-gray-500 px-4 uppercase tracking-wider">Or Continue With</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Social Sign-In */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSocialSignIn("google")}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-purple-500/20 text-sm text-gray-300 font-medium transition-all cursor-pointer"
            >
              <svg className="h-5 w-5" width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSocialSignIn("github")}
              disabled={loading}
              className="flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-purple-500/20 text-sm text-gray-300 font-medium transition-all cursor-pointer"
            >
              <svg className="h-5 w-5" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Continue with GitHub</span>
            </motion.button>
          </div>


          {/* Toggle Link */}
          <div className="text-center text-xs text-gray-500 mt-2">
            {mode === "signin" ? (
              <span>
                No account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline hover:no-underline transition-all cursor-pointer"
                >
                  Create one
                </button>
              </span>
            ) : (
              <span>
                Have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-purple-400 hover:text-purple-300 font-semibold underline hover:no-underline transition-all cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </div>
      </>
      )}
    </AnimatePresence>
  );
}
