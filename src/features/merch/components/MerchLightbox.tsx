"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface MerchLightboxProps {
  images: string[];
  title: string;
  initialIndex: number;
  onClose: () => void;
}

export function MerchLightbox({ images, title, initialIndex, onClose }: MerchLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goToNext();
      if (event.key === "ArrowLeft") goToPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [goToNext, goToPrev, onClose]);

  if (!mounted || images.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-[rgba(18,16,13,0.82)] backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute left-4 top-4 z-10 font-mono text-[11px] tracking-[0.12em] text-[var(--color-cream)] md:left-6 md:top-6">
        {currentIndex + 1} / {images.length}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-white/20 bg-black/25 text-[var(--color-cream)] transition-colors hover:bg-black/45 md:right-6 md:top-6"
        aria-label="Close merch viewer"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-3 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/20 text-[var(--color-cream)] transition-colors hover:bg-black/40 md:flex"
            aria-label="Previous merch image"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/20 text-[var(--color-cream)] transition-colors hover:bg-black/40 md:flex"
            aria-label="Next merch image"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      ) : null}

      <div className="flex min-h-full items-center justify-center px-4 py-20 md:px-12">
        <div className="w-full max-w-[1100px] overflow-hidden bg-white shadow-2xl">
          <div className="flex items-center justify-center bg-white px-4 py-4 md:px-8 md:py-8">
            <img
              src={images[currentIndex]}
              alt={`${title} image ${currentIndex + 1}`}
              className="block max-h-[72vh] w-auto max-w-full object-contain"
            />
          </div>

          <div className="border-t border-[var(--color-rule)] px-5 py-4 md:px-8 md:py-5">
            <div className="font-display text-[clamp(24px,2.6vw,34px)] tracking-[-0.02em] text-[var(--color-near-black)]">
              {title}
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Merch image preview
            </div>
          </div>
        </div>
      </div>

      {images.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={goToPrev}
            className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/25 text-[var(--color-cream)]"
            aria-label="Previous merch image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/25 text-[var(--color-cream)]"
            aria-label="Next merch image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
