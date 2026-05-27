import { useState, useRef, useEffect } from "react";

export function BeforeAfterSlider({ original, result }: { original: string, result: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[60vh] max-h-[800px] overflow-hidden rounded-xl cursor-ew-resize select-none"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Original Image (Background) */}
      <img 
        src={original} 
        alt="Original" 
        className="absolute inset-0 w-full h-full object-cover filter grayscale"
        draggable="false"
      />
      
      {/* Result Image (Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={result} 
          alt="Restored" 
          className="absolute inset-0 w-full h-full object-cover max-w-none"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
          draggable="false"
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,240,255,0.8)] pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
            <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
        ORIGINAL
      </div>
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-neon-blue">
        ULTRA-HD
      </div>
    </div>
  );
}
