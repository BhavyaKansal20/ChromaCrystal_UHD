import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";

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
    <div 
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
        isDragOver 
          ? "border-neon-blue bg-neon-blue/10 scale-105 glow-border" 
          : "border-gray-600 hover:border-gray-400 hover:bg-gray-800/50"
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
      <div className="flex flex-col items-center justify-center pointer-events-none">
        <UploadCloud className={`w-20 h-20 mb-6 transition-colors ${isDragOver ? "text-neon-blue" : "text-gray-400"}`} />
        <h3 className="text-2xl font-semibold mb-2">Drag & Drop your historical photo here</h3>
        <p className="text-gray-400">or click to browse from your device</p>
      </div>
    </div>
  );
}
