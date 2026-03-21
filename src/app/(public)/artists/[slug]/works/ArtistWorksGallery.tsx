"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArtworkLightbox } from "@/features/artworks/components/ArtworkLightbox";
import { PublicProfileOwnerActions } from "@/features/artists/components/PublicProfileOwnerActions";

type GalleryArtwork = {
  id: string;
  title: string;
  imageUrl: string;
  category?: string | null;
  artType?: string | null;
  description?: string | null;
  artistName?: string;
};

interface ArtistWorksGalleryProps {
  artistName: string;
  artistSlug: string;
  artistId: string;
  portfolioArtworks: GalleryArtwork[];
  approvedArtworks: GalleryArtwork[];
}

function GallerySection({
  title,
  artworks,
  onSelect,
}: {
  title: string;
  artworks: GalleryArtwork[];
  onSelect: (index: number) => void;
}) {
  if (artworks.length === 0) return null;

  return (
    <section className="mt-16 first:mt-0">
      <Reveal>
        <SectionLabel>{title}</SectionLabel>
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-x-14 gap-y-18 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-18 lg:gap-y-24">
        {artworks.map((artwork, index) => (
          <Reveal key={artwork.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
            <button
              type="button"
              onClick={() => onSelect(index)}
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
    </section>
  );
}

export function ArtistWorksGallery({
  artistName,
  artistSlug,
  artistId,
  portfolioArtworks,
  approvedArtworks,
}: ArtistWorksGalleryProps) {
  const [selectedSection, setSelectedSection] = useState<"portfolio" | "approved" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const activeArtworks = useMemo(() => {
    if (selectedSection === "portfolio") return portfolioArtworks;
    if (selectedSection === "approved") return approvedArtworks;
    return [];
  }, [approvedArtworks, portfolioArtworks, selectedSection]);

  const openPortfolio = (index: number) => {
    setSelectedSection("portfolio");
    setSelectedIndex(index);
  };

  const openApproved = (index: number) => {
    setSelectedSection("approved");
    setSelectedIndex(index);
  };

  return (
    <div className="pt-28 pb-24 px-6 md:px-12 bg-[var(--color-linen)] min-h-screen">
      <div className="max-w-[1240px] mx-auto">
        <Reveal>
          <SectionLabel>All Works</SectionLabel>
        </Reveal>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[clamp(38px,6vw,68px)] leading-[1.02] tracking-[-0.02em] text-[var(--color-near-black)]">
              {artistName}
            </h1>
            <p className="mt-4 max-w-[680px] text-base leading-[1.75] text-[var(--color-warm-slate)]">
              Browse the work first. Open any piece to see the details.
            </p>
          </div>

          <Link
            href={`/artists/${artistSlug}`}
            className="inline-flex items-center justify-center border border-[var(--color-near-black)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
          >
            Back To Artist
          </Link>
        </div>

        <PublicProfileOwnerActions
          artistId={artistId}
          artistSlug={artistSlug}
          compact
          showEditProfile={false}
        />

        {portfolioArtworks.length === 0 && approvedArtworks.length === 0 ? (
          <div className="mt-16 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
            No public artworks yet.
          </div>
        ) : null}

        <GallerySection title="Public Portfolio" artworks={portfolioArtworks} onSelect={openPortfolio} />
        <GallerySection
          title="Approved Exhibition Works"
          artworks={approvedArtworks}
          onSelect={openApproved}
        />
      </div>

      {selectedSection && selectedIndex !== null ? (
        <ArtworkLightbox
          artworks={activeArtworks.map((artwork) => ({
            id: artwork.id,
            imageUrl: artwork.imageUrl,
            title: artwork.title,
            artistName: artwork.artistName,
            category: artwork.category,
            artType: artwork.artType,
            description: artwork.description,
          }))}
          initialIndex={selectedIndex}
          onClose={() => {
            setSelectedSection(null);
            setSelectedIndex(null);
          }}
        />
      ) : null}
    </div>
  );
}
