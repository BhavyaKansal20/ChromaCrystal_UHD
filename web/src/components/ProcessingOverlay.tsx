import { motion } from "framer-motion";

export function ProcessingOverlay({ 
  progress, 
  queuePosition, 
  status 
}: { 
  progress: number; 
  queuePosition: number | null; 
  status: string;
}) {
  const steps = [
    { label: "Analyzing Historical Details...", threshold: 0 },
    { label: "Restoring Facial Textures...", threshold: 30 },
    { label: "Generating Cinematic Colors...", threshold: 50 },
    { label: "Upscaling To Ultra-HD...", threshold: 70 },
    { label: "Finalizing Crystal Restoration...", threshold: 90 },
  ];

  const currentStep = steps.reverse().find((s) => progress >= s.threshold)?.label || steps[0].label;

  const isQueued = status === "pending";

  return (
    <div className="py-10 md:py-20 flex flex-col items-center justify-center text-center">
      <div className="relative w-40 h-40 md:w-56 md:h-56 mb-8 md:mb-12">
        {/* Sci-fi Pulse Background */}
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-4 bg-blue-500/20 rounded-full blur-md animate-ping" style={{ animationDuration: '3s' }} />
        
        <svg className="relative z-10 w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="rgba(10,10,25,0.8)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ strokeDasharray: isQueued ? "60 220" : "0 300" }}
            animate={isQueued 
              ? { strokeDashoffset: [0, -280] }
              : { strokeDasharray: `${progress * 2.83} 300`, strokeDashoffset: 0 }
            }
            transition={isQueued
              ? { repeat: Infinity, duration: 1.5, ease: "linear" }
              : { duration: 0.5, ease: "easeOut" }
            }
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isQueued ? (
            <>
              <span className="text-xs text-gray-500 font-semibold tracking-widest uppercase mb-1">Queue</span>
              <span className="text-3xl font-bold glow-text leading-none">
                {queuePosition !== null ? `#${queuePosition + 1}` : "..."}
              </span>
            </>
          ) : (
            <span className="text-3xl font-bold glow-text">{Math.round(progress)}%</span>
          )}
        </div>
      </div>
      
      <motion.div
        key={isQueued ? `queue-${queuePosition}` : currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg md:text-2xl font-light tracking-wide text-neon-blue min-h-[3rem] md:h-8 px-4"
      >
        {isQueued ? (
          queuePosition === 0 ? (
            <span className="text-neon-purple font-medium">You are next in line. Preparing restoration...</span>
          ) : queuePosition !== null ? (
            <span>Waiting in queue ({queuePosition} {queuePosition === 1 ? 'job' : 'jobs'} ahead)</span>
          ) : (
            <span>Connecting to queue...</span>
          )
        ) : (
          currentStep
        )}
      </motion.div>
    </div>
  );
}
