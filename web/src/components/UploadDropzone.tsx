import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

export function UploadDropzone({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative rounded-2xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-300 overflow-hidden border-2 border-dashed ${
        isDragOver
          ? "border-purple-500 bg-purple-500/10 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
          : "border-white/[0.1] hover:border-purple-500/40 hover:bg-white/[0.02]"
      }`}
      onDragEnter={(e) => { handleDrag(e); setIsDragOver(true); }}
      onDragLeave={(e) => { handleDrag(e); setIsDragOver(false); }}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById("fileInput")?.click()}
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/webp, image/avif, image/heic"
        onChange={(e) => e.target.files && onUpload(e.target.files[0])}
      />

      <div className="relative z-10 flex flex-col items-center pointer-events-none">
        <motion.div
          animate={{ y: isDragOver ? -8 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`p-4 rounded-2xl border mb-6 transition-colors ${
            isDragOver
              ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
              : "bg-white/[0.05] border-white/[0.08] text-gray-400"
          }`}
        >
          <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12" />
        </motion.div>

        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
          Drag & drop your photo here
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse from your device
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {["PNG", "JPG", "WEBP", "HEIC", "AVIF"].map((fmt) => (
            <span key={fmt} className="px-2 py-0.5 text-[10px] font-mono text-gray-500 bg-white/[0.03] border border-white/[0.06] rounded">
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
