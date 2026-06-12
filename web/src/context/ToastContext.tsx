"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto close toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            let icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
            let borderColor = "border-cyan-500/30";
            let shadowColor = "rgba(6, 182, 212, 0.15)";
            if (t.type === "success") {
              icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
              borderColor = "border-emerald-500/30";
              shadowColor = "rgba(16, 185, 129, 0.15)";
            } else if (t.type === "error") {
              icon = <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />;
              borderColor = "border-red-500/30";
              shadowColor = "rgba(239, 68, 68, 0.15)";
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                style={{
                  boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px ${shadowColor}`,
                }}
                className={`liquid-glass p-4 border ${borderColor} flex items-center justify-between gap-3 pointer-events-auto w-full`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {icon}
                  <span className="text-xs font-semibold text-white tracking-wide leading-relaxed">
                    {t.message}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-500 hover:text-white p-0.5 rounded-lg hover:bg-white/[0.05] transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
