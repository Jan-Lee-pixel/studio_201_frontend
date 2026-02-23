"use client";

import { useState } from "react";
import { Lightbox } from "./Lightbox";

interface ImageGridProps {
  images: { id: string; url: string; alt?: string; type?: "image" | "video"; thumbnailUrl?: string }[];
}

export function ImageGrid({ images }: ImageGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return <div className="py-20 text-center text-[var(--color-warm-slate)]">No documentation available for this event yet.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px]">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="aspect-square relative cursor-pointer overflow-hidden group bg-[var(--color-bone)]"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={image.thumbnailUrl || image.url}
              alt={image.alt || `Event photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
            {image.type === "video" ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 text-white rounded-full p-3 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9z" /></svg>
                </div>
              </div>
            ) : null}
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white drop-shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
