"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ProcessingOverlay } from "@/components/ProcessingOverlay";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { motion } from "framer-motion";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle"); // idle, pending, processing, completed, error
  const [progress, setProgress] = useState<number>(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<number>(4);
  const [colorIntensity, setColorIntensity] = useState<number>(1.0);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(10);
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

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });
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
    <div className="flex flex-col items-center justify-center w-full px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight glow-text text-white">
          ChromaCrystal<span className="text-neon-blue">_UHD</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light">
          Transform Black & White Memories Into Ultra-HD Reality
        </p>
      </motion.div>

      <div className="w-full max-w-4xl glass-card rounded-2xl p-8 relative overflow-hidden">
        {status === "idle" && (
          <div className="flex flex-col gap-6">
            <UploadDropzone onUpload={handleUpload} />
            
            <div className="w-full">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-neon-blue hover:text-white transition-colors text-sm font-semibold tracking-wider uppercase mb-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${showSettings ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                Advanced Options
              </button>
              
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-gray-900/50 rounded-xl p-6 border border-gray-800"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Upscale */}
                    <div className="flex flex-col gap-3">
                      <label className="text-sm text-gray-400 font-medium">Ultra-HD Upscale Factor</label>
                      <select 
                        value={upscaleFactor} 
                        onChange={(e) => setUpscaleFactor(Number(e.target.value))}
                        className="bg-black/50 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-neon-blue"
                      >
                        <option value={2}>2x (Faster)</option>
                        <option value={4}>4x (Standard HD)</option>
                        <option value={8}>8x (Ultra-HD 4K)</option>
                      </select>
                    </div>

                    {/* Color Intensity */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between">
                        <label className="text-sm text-gray-400 font-medium">Color Vibrancy</label>
                        <span className="text-neon-blue text-xs font-bold">{colorIntensity}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value={colorIntensity} 
                        onChange={(e) => setColorIntensity(parseFloat(e.target.value))}
                        className="w-full accent-neon-blue"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Muted</span>
                        <span>Cinematic</span>
                      </div>
                    </div>

                    {/* Denoise */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between">
                        <label className="text-sm text-gray-400 font-medium">Scratch / Noise Removal</label>
                        <span className="text-neon-blue text-xs font-bold">{denoiseStrength}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="30" 
                        step="1" 
                        value={denoiseStrength} 
                        onChange={(e) => setDenoiseStrength(parseInt(e.target.value))}
                        className="w-full accent-neon-purple"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Preserve Grain</span>
                        <span>Smooth</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {(status === "processing" || status === "pending") && (
          <ProcessingOverlay progress={progress} queuePosition={queuePosition} status={status} />
        )}

        {status === "completed" && originalUrl && resultUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BeforeAfterSlider original={originalUrl} result={resultUrl} />
            <div className="mt-8 flex justify-center gap-4">
              <button 
                onClick={() => setStatus("idle")}
                className="px-6 py-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Restore Another
              </button>
              <a 
                href={resultUrl}
                download
                className="px-6 py-3 rounded-full bg-gradient-neon text-white font-semibold hover:opacity-90 transition-opacity glow-border"
              >
                Download Masterpiece
              </a>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <div className="text-center py-12">
            <p className="text-red-400 text-xl mb-4">An error occurred during restoration.</p>
            <button 
              onClick={() => setStatus("idle")}
              className="px-6 py-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
