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
}

export function ArtworkPreviewGrid({ artworks }: ArtworkPreviewGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (artworks.length === 0) return null;

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-18 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-18 lg:gap-y-24">
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
