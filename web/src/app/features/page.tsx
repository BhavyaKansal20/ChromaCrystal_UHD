"use client";

import { motion } from "framer-motion";
import {
  Palette, ScanFace, Maximize, Users, Zap, Shield, Sparkles
} from "lucide-react";

const features = [
  { icon: Palette, title: "AI Colorization", desc: "DeOldify ONNX engine brings vibrant, historically accurate colors to grayscale photos.", color: "purple" },
  { icon: ScanFace, title: "Face Restoration", desc: "GFPGAN restores facial micro-details — eyes, skin texture, and expressions with stunning clarity.", color: "blue" },
  { icon: Maximize, title: "4K Ultra-HD Upscale", desc: "Real-ESRGAN upscales images to crystal-clear 4K resolution with AI-painted smoothness.", color: "cyan" },
  { icon: Users, title: "5-User Concurrency", desc: "Factory Assembly Line architecture handles 5 simultaneous users on a 2-Core Free-Tier CPU.", color: "pink" },
  { icon: Zap, title: "20-Second Execution", desc: "Dynamic Load-Shedding Brain ensures all processing completes in under 20 seconds.", color: "purple" },
  { icon: Shield, title: "Zero Data Storage", desc: "Images are processed in-memory and never stored. Your memories stay private and secure.", color: "blue" },
];

const iconColors: Record<string, string> = {
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
  pink: "text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
};

export default function FeaturesPage() {
  return (
    <div className="py-20 sm:py-28 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-medium text-purple-300 mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Advanced AI Pipeline Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
          Everything You <span className="gradient-text">Need</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Powered by 3 deep learning models, enterprise-grade architecture, and hyper-optimized load balancers.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card glass-card-hover p-8 relative overflow-hidden group"
          >
            {/* Ambient hover light */}
            <div className="absolute -inset-px bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className={`relative z-10 inline-flex p-3 rounded-xl border mb-5 transition-transform duration-300 group-hover:scale-110 ${iconColors[f.color]}`}>
              <f.icon className="h-5 w-5" />
            </div>
            
            <h3 className="relative z-10 text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
            <p className="relative z-10 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
