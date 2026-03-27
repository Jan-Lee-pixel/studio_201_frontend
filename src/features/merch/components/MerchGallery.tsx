"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import { MerchLightbox } from "./MerchLightbox";

interface MerchGalleryProps {
  title: string;
  images: string[];
}

export function MerchGallery({ title, images }: MerchGalleryProps) {
  const galleryImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [galleryImages]);

  const selectedImage = galleryImages[selectedIndex] || null;
  const canNavigate = galleryImages.length > 1;

  const goToNext = () => {
    if (!canNavigate) return;
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = () => {
    if (!canNavigate) return;
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (touchStartX === null || !canNavigate) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 48) {
      if (delta < 0) goToNext();
      if (delta > 0) goToPrev();
    }
    setTouchStartX(null);
  };

  return (
    <>
      <div className="w-full">
        <div className="overflow-hidden rounded-[26px] border border-[var(--color-rule)] bg-white shadow-[0_18px_42px_rgba(33,28,24,0.05)]">
          <div className="relative bg-[var(--color-bone)]">
            <button
              type="button"
              className="flex min-h-[300px] w-full items-center justify-center p-4 text-left transition-colors hover:bg-white md:min-h-[560px] md:p-8"
              onClick={() => {
                if (selectedImage) setIsLightboxOpen(true);
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-label={selectedImage ? `Open large preview for ${title}` : `${title} preview unavailable`}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={title}
                  className="block max-h-[260px] w-auto max-w-full object-contain md:max-h-[480px]"
                />
              ) : (
                <StudioImagePlaceholder className="h-full w-full" markClassName="w-16" />
              )}
            </button>

            {canNavigate ? (
              <>
                <button
                  type="button"
                  onClick={goToPrev}
                  className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(26,24,20,0.1)] bg-white/88 text-[var(--color-near-black)] shadow-[0_12px_24px_rgba(33,28,24,0.08)] transition-colors hover:bg-white md:flex"
                  aria-label="Previous merch image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(26,24,20,0.1)] bg-white/88 text-[var(--color-near-black)] shadow-[0_12px_24px_rgba(33,28,24,0.08)] transition-colors hover:bg-white md:flex"
                  aria-label="Next merch image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 right-3 rounded-full bg-[rgba(255,255,255,0.92)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)] shadow-[0_10px_18px_rgba(33,28,24,0.06)]">
                  {selectedIndex + 1} / {galleryImages.length}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {galleryImages.length > 1 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-6 md:gap-3 md:overflow-visible md:pb-0">
            {galleryImages.map((image, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`w-20 shrink-0 overflow-hidden rounded-[18px] border bg-white p-1.5 transition-colors md:w-auto md:p-2 ${
                    isActive
                      ? "border-[var(--color-near-black)]"
                      : "border-[var(--color-rule)] hover:border-[var(--color-dust)]"
                  }`}
                  aria-label={`Show merch image ${index + 1}`}
                >
                  <div className="flex aspect-square items-center justify-center bg-[var(--color-bone)] p-2">
                    <img
                      src={image}
                      alt={`${title} thumbnail ${index + 1}`}
                      className="max-h-full w-auto max-w-full object-contain"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {isLightboxOpen && selectedImage ? (
        <MerchLightbox
          images={galleryImages}
          title={title}
          initialIndex={selectedIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      ) : null}
    </>
  );
}
