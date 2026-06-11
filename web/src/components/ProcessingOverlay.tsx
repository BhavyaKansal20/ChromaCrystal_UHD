import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function ProcessingOverlay({
  progress,
  queuePosition,
  status,
}: {
  progress: number;
  queuePosition: number | null;
  status: string;
}) {
  const pipelineSteps = [
    { label: "Analyzing image details", threshold: 0 },
    { label: "Restoring facial textures", threshold: 25 },
    { label: "Generating cinematic colors", threshold: 45 },
    { label: "Upscaling to Ultra-HD", threshold: 65 },
    { label: "Finalizing crystal restoration", threshold: 85 },
  ];

  const isQueued = status === "pending";

  return (
    <div className="py-10 sm:py-16 flex flex-col items-center justify-center">
      {/* Loader Ring */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-10">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-2xl animate-pulse" />

        <svg className="relative z-10 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="44"
            fill="rgba(3, 0, 20, 0.8)"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="url(#progress-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ strokeDasharray: isQueued ? "50 230" : "0 280" }}
            animate={
              isQueued
                ? { strokeDashoffset: [0, -280] }
                : { strokeDasharray: `${progress * 2.76} 280`, strokeDashoffset: 0 }
            }
            transition={
              isQueued
                ? { repeat: Infinity, duration: 1.5, ease: "linear" }
                : { duration: 0.5, ease: "easeOut" }
            }
          />
          <defs>
            <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {isQueued ? (
            <>
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Queue</span>
              <span className="text-2xl font-bold gradient-text">
                {queuePosition !== null ? `#${queuePosition + 1}` : "..."}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold gradient-text">{Math.round(progress)}%</span>
          )}
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="w-full max-w-sm space-y-3">
        {isQueued ? (
          <motion.p
            key={`queue-${queuePosition}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-gray-400"
          >
            {queuePosition === 0 ? (
              <span className="text-purple-400 font-medium">You&apos;re next. Preparing restoration...</span>
            ) : queuePosition !== null ? (
              <span>Waiting in queue ({queuePosition} {queuePosition === 1 ? "job" : "jobs"} ahead)</span>
            ) : (
              <span>Connecting to queue...</span>
            )}
          </motion.p>
        ) : (
          pipelineSteps.map((step) => {
            const done = progress >= step.threshold + 15;
            const active = progress >= step.threshold && !done;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  done ? "bg-green-500/20 text-green-400" : active ? "bg-purple-500/20 text-purple-400" : "bg-white/[0.03] text-gray-600"
                }`}>
                  {done ? <CheckCircle className="h-3.5 w-3.5" /> : (
                    active ? <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                  )}
                </div>
                <span className={`text-xs transition-colors ${
                  done ? "text-gray-500 line-through" : active ? "text-white font-medium" : "text-gray-600"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
