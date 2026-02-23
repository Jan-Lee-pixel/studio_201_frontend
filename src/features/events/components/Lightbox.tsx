"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  images: { id: string; url: string; alt?: string; type?: "image" | "video" }[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent scrolling behind modal
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, goToNext, goToPrev]);

  if (!images.length || !mounted) return null;

  const currentImage = images[currentIndex];

  const content = (
    <div className="fixed inset-0 z-[99999] bg-[rgba(15,14,10,0.85)] backdrop-blur-sm flex flex-col">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between p-4 md:p-6 fixed top-0 w-full z-10 pointer-events-none">
        <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-dust)] bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-auto">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={onClose}
          className="text-[var(--color-dust)] hover:text-white transition-colors p-2 cursor-pointer bg-black/40 hover:bg-black/60 rounded-full backdrop-blur-md border-none pointer-events-auto"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      {/* Main Content Area - Scrollable */}
      <div
        className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="min-h-full w-full py-24 px-4 md:px-20 flex justify-center items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="relative max-w-5xl w-full bg-[var(--color-near-black)] p-4 md:p-8 rounded-lg shadow-2xl border border-[var(--color-rule)]">
            {currentImage.type === "video" ? (
              <video
                src={currentImage.url}
                controls
                autoPlay
                className="w-full h-auto object-contain rounded"
              />
            ) : (
              <img
                src={currentImage.url}
                alt={currentImage.alt || `Event photo ${currentIndex + 1}`}
                className="w-full h-auto object-contain rounded"
              />
            )}
          </div>
        </div>

        {/* Side Navigation Buttons (Desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-[var(--color-dust)] hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all border-none cursor-pointer hidden md:block"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-[var(--color-dust)] hover:text-white bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-all border-none cursor-pointer hidden md:block"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        {/* Image Info / Bottom Bar */}
        {currentImage.alt && (
          <div className="fixed bottom-0 w-full p-6 text-center bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10">
            <p className="font-body text-base text-[var(--color-cream)] m-0 drop-shadow-md">
              {currentImage.alt}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
