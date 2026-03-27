"use client";

import { useState } from "react";
import { Reveal } from "@/components/animation/Reveal";
import { ArtworkLightbox } from "./ArtworkLightbox";

export type ArtworkPreviewItem = {
  id: string;
  title: string;
  imageUrl: string;
  category?: string | null;
  artType?: string | null;
  description?: string | null;
  artistName?: string;
};

interface ArtworkPreviewGridProps {
  artworks: ArtworkPreviewItem[];
  singleArtworkAlign?: "center" | "start";
  singleArtworkMaxWidth?: string;
}

export function ArtworkPreviewGrid({
  artworks,
  singleArtworkAlign = "center",
  singleArtworkMaxWidth = "460px",
}: ArtworkPreviewGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (artworks.length === 0) return null;

  const singleArtwork = artworks.length === 1;

  return (
    <>
      {singleArtwork ? (
        <div className={`mt-8 flex ${singleArtworkAlign === "start" ? "justify-start" : "justify-center"}`}>
          {artworks.map((artwork, index) => (
            <Reveal key={artwork.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group block w-full cursor-zoom-in border-none bg-transparent p-0 text-left"
                style={{ maxWidth: singleArtworkMaxWidth }}
                aria-label={`View ${artwork.title}`}
              >
                <div className="flex items-center justify-center">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="block h-auto max-h-[560px] w-auto max-w-full object-contain shadow-[0_18px_42px_rgba(33,28,24,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4 px-1">
                  <div className="min-w-0">
                    <div className="truncate font-body text-[15px] font-semibold leading-tight text-[var(--color-near-black)]">
                      {artwork.title}
                    </div>
                    {[artwork.category, artwork.artType].filter(Boolean).length > 0 ? (
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)]">
                        {[artwork.category, artwork.artType].filter(Boolean).join(" · ")}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-16">
          {artworks.map((artwork, index) => (
            <Reveal key={artwork.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group block w-full cursor-zoom-in border-none bg-transparent p-0 text-left"
                aria-label={`View ${artwork.title}`}
              >
                <div className="flex min-h-[220px] items-center justify-center sm:min-h-[260px] md:min-h-[320px]">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="block h-auto max-h-[420px] w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015]"
                  />
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {selectedIndex !== null ? (
        <ArtworkLightbox
          artworks={artworks.map((artwork) => ({
            id: artwork.id,
            imageUrl: artwork.imageUrl,
            title: artwork.title,
            artistName: artwork.artistName,
            category: artwork.category,
            artType: artwork.artType,
            description: artwork.description,
          }))}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      ) : null}
    </>
  );
}
