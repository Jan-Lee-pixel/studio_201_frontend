"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    setSelectedIndex(0);
  }, [galleryImages]);

  const selectedImage = galleryImages[selectedIndex] || null;

  return (
    <>
      <div className="mx-auto w-full max-w-[520px]">
        <div className="overflow-hidden border border-[var(--color-rule)] bg-white">
          <button
            type="button"
            className="flex min-h-[360px] w-full items-center justify-center bg-[var(--color-bone)] p-8 text-left transition-colors hover:bg-white md:min-h-[520px] md:p-12"
            onClick={() => {
              if (selectedImage) setIsLightboxOpen(true);
            }}
            aria-label={selectedImage ? `Open large preview for ${title}` : `${title} preview unavailable`}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={title}
                className="block max-h-[300px] w-auto max-w-full object-contain md:max-h-[420px]"
              />
            ) : (
              <StudioImagePlaceholder className="h-full w-full" markClassName="w-16" />
            )}
          </button>
        </div>

        {galleryImages.length > 1 ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {galleryImages.map((image, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`overflow-hidden border bg-white p-2 transition-colors ${
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
