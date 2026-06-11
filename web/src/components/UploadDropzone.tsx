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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`border-2 border-dashed rounded-xl p-8 md:p-16 text-center transition-all duration-300 cursor-pointer relative overflow-hidden glass ${
        isDragOver 
          ? "border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(139,92,246,0.3)]" 
          : "border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5"
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
      <div className="flex flex-col items-center justify-center pointer-events-none z-10 relative">
        <motion.div
          animate={{ y: isDragOver ? -10 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <UploadCloud className={`w-16 h-16 md:w-24 md:h-24 mb-6 transition-colors ${isDragOver ? "text-purple-400" : "text-gray-400"}`} />
        </motion.div>
        <h3 className="text-xl md:text-3xl font-bold mb-3 tracking-tight text-white glow-text">
          Drag & Drop your historical photo here
        </h3>
        <p className="text-sm md:text-lg text-gray-400 font-medium">
          or click to browse from your device
        </p>
      </div>
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
