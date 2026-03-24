"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ArtworkLightboxItem = {
  id: string;
  imageUrl: string;
  title: string;
  artistName?: string;
  category?: string | null;
  artType?: string | null;
  description?: string | null;
};

interface ArtworkLightboxProps {
  artworks: ArtworkLightboxItem[];
  initialIndex: number;
  onClose: () => void;
}

export function ArtworkLightbox({ artworks, initialIndex, onClose }: ArtworkLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === artworks.length - 1 ? 0 : prev + 1));
  }, [artworks.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? artworks.length - 1 : prev - 1));
  }, [artworks.length]);

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

  if (!mounted || artworks.length === 0) return null;

  const currentArtwork = artworks[currentIndex];
  const detailLine = [currentArtwork.artistName, currentArtwork.category, currentArtwork.artType]
    .filter(Boolean)
    .join(" · ");
  const compactDescription =
    currentArtwork.description && currentArtwork.description.length > 180
      ? `${currentArtwork.description.slice(0, 177)}...`
      : currentArtwork.description;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-[rgba(18,16,13,0.82)] backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={currentArtwork.title}
    >
      <div className="absolute left-4 top-4 z-10 font-mono text-[11px] tracking-[0.12em] text-[var(--color-cream)] md:left-6 md:top-6">
        {currentIndex + 1} / {artworks.length}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-white/20 bg-black/25 text-[var(--color-cream)] transition-colors hover:bg-black/45 md:right-6 md:top-6"
        aria-label="Close artwork viewer"
      >
        <X className="h-5 w-5" />
      </button>

      {artworks.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-3 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/20 text-[var(--color-cream)] transition-colors hover:bg-black/40 md:flex"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center border border-white/15 bg-black/20 text-[var(--color-cream)] transition-colors hover:bg-black/40 md:flex"
            aria-label="Next artwork"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      ) : null}

      <div className="flex min-h-full items-center justify-center px-4 py-16 md:px-8">
        <div className="w-full max-w-[min(92vw,960px)]">
          <div className="mx-auto flex w-fit max-w-full items-center justify-center rounded-[24px] bg-[rgba(255,255,255,0.96)] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-4">
            <img
              src={currentArtwork.imageUrl}
              alt={currentArtwork.title}
              className="block max-h-[68vh] w-auto max-w-[min(82vw,760px)] object-contain"
            />
          </div>

          <div className="mx-auto mt-4 max-w-[min(82vw,760px)] rounded-[20px] bg-[rgba(255,255,255,0.96)] px-5 py-4 shadow-[0_18px_42px_rgba(0,0,0,0.18)] md:px-6">
            <div className="font-display text-[clamp(24px,2.6vw,34px)] font-normal tracking-[-0.02em] text-[var(--color-near-black)]">
              {currentArtwork.title}
            </div>
            {detailLine ? (
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                {detailLine}
              </div>
            ) : null}
            {compactDescription ? (
              <p className="mt-3 max-w-3xl text-sm leading-[1.7] text-[var(--color-warm-slate)]">
                {compactDescription}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {artworks.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={goToPrev}
            className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/25 text-[var(--color-cream)]"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="flex h-11 w-11 items-center justify-center border border-white/15 bg-black/25 text-[var(--color-cream)]"
            aria-label="Next artwork"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </div>,
    document.body
  );
}
