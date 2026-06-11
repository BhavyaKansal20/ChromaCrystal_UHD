import { useState, useRef } from "react";

export function BeforeAfterSlider({ original, result }: { original: string; result: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      setSliderPosition((x / rect.width) * 100);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[50vh] sm:h-[60vh] max-h-[700px] overflow-hidden rounded-2xl cursor-ew-resize select-none border border-white/[0.08]"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* Original (Background) */}
      <img
        src={original}
        alt="Original"
        className="absolute inset-0 w-full h-full object-contain filter grayscale"
        draggable="false"
      />

      {/* Result (Clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
        <img
          src={result}
          alt="Restored"
          className="absolute inset-0 h-full object-contain max-w-none"
          style={{ width: containerRef.current?.offsetWidth || "100%" }}
          draggable="false"
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-[2px] pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute inset-0 bg-white/80 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border border-white/20">
          <div className="flex gap-[3px]">
            <div className="w-[2px] h-3 bg-gray-400 rounded-full" />
            <div className="w-[2px] h-3 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-[10px] font-mono tracking-wider glass text-gray-300">
        ORIGINAL
      </div>
      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg text-[10px] font-mono tracking-wider glass text-purple-300">
        ULTRA-HD
      </div>
    </div>
  );
}
