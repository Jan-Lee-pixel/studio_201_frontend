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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null || images.length <= 1) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 48) {
      if (delta < 0) goToNext();
      if (delta > 0) goToPrev();
    }
    setTouchStartX(null);
  };

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
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/25 text-[var(--color-cream)] transition-colors hover:bg-black/45 md:right-6 md:top-6"
        aria-label="Close merch viewer"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-3 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-[var(--color-cream)] transition-colors hover:bg-black/40 md:flex"
            aria-label="Previous merch image"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-[var(--color-cream)] transition-colors hover:bg-black/40 md:flex"
            aria-label="Next merch image"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      ) : null}

      <div
        className="flex min-h-full items-center justify-center px-4 py-16 md:px-10"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-[min(92vw,980px)]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div className="mx-auto flex w-fit max-w-full items-center justify-center rounded-[22px] bg-[rgba(255,255,255,0.96)] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:rounded-[26px] md:p-3">
            <img
              src={images[currentIndex]}
              alt={`${title} image ${currentIndex + 1}`}
              className="block max-h-[72vh] w-auto max-w-[min(82vw,760px)] object-contain"
            />
          </div>
        </div>
      </div>

      {images.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={goToPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[var(--color-cream)]"
            aria-label="Previous merch image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[var(--color-cream)]"
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
