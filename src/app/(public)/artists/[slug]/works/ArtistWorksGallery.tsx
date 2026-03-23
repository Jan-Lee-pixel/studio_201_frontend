"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArtworkPreviewGrid } from "@/features/artworks/components/ArtworkPreviewGrid";
import { PublicProfileOwnerActions } from "@/features/artists/components/PublicProfileOwnerActions";
import type { ArtworkPreviewItem } from "@/features/artworks/components/ArtworkPreviewGrid";

interface ArtistWorksGalleryProps {
  artistName: string;
  artistSlug: string;
  artistId: string;
  portfolioArtworks: ArtworkPreviewItem[];
  approvedArtworks: Array<
    ArtworkPreviewItem & {
      exhibitionId?: string;
      exhibitionTitle?: string | null;
      exhibitionSlug?: string | null;
    }
  >;
}

const DEFAULT_APPROVED_PREVIEW_COUNT = 3;

function ApprovedExhibitionSection({
  exhibitionId,
  exhibitionTitle,
  exhibitionSlug,
  artworks,
}: {
  exhibitionId: string;
  exhibitionTitle: string;
  exhibitionSlug?: string | null;
  artworks: ArtworkPreviewItem[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleArtworks = isExpanded ? artworks : artworks.slice(0, DEFAULT_APPROVED_PREVIEW_COUNT);
  const hiddenCount = Math.max(0, artworks.length - DEFAULT_APPROVED_PREVIEW_COUNT);
  const showToggle = artworks.length > DEFAULT_APPROVED_PREVIEW_COUNT;
  const exhibitionHref = exhibitionSlug ? `/exhibitions/${exhibitionSlug}` : null;

  return (
    <section key={exhibitionId} className="mt-16 first:mt-0">
      <div className="sticky top-[86px] z-10 -mx-6 bg-[var(--color-linen)]/95 px-6 pb-6 pt-2 backdrop-blur-sm md:-mx-12 md:px-12">
        <div className="flex flex-col gap-4 border-b border-[var(--color-rule)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Exhibition
            </div>
            <div className="mt-3">
              {exhibitionHref ? (
                <Link
                  href={exhibitionHref}
                  className="font-display text-[clamp(26px,3vw,38px)] leading-[1.08] tracking-[-0.02em] text-[var(--color-near-black)] transition-colors duration-300 hover:text-[var(--color-sienna)]"
                >
                  {exhibitionTitle}
                </Link>
              ) : (
                <h2 className="font-display text-[clamp(26px,3vw,38px)] leading-[1.08] tracking-[-0.02em] text-[var(--color-near-black)]">
                  {exhibitionTitle}
                </h2>
              )}
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              {artworks.length} approved work{artworks.length === 1 ? "" : "s"}
            </div>
          </div>

          {showToggle ? (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="inline-flex items-center justify-center border border-[var(--color-near-black)] bg-[var(--color-linen)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
            >
              {isExpanded ? "Show Fewer Works" : `Show ${hiddenCount} More Works`}
            </button>
          ) : null}
        </div>
      </div>

      <ArtworkPreviewGrid artworks={visibleArtworks} />

      {showToggle && isExpanded ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center justify-center border border-[var(--color-near-black)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
          >
            Show Fewer Works
          </button>
        </div>
      ) : null}
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
  const approvedArtworkGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        exhibitionId: string;
        exhibitionTitle: string;
        exhibitionSlug?: string | null;
        artworks: ArtworkPreviewItem[];
      }
    >();

    approvedArtworks.forEach((artwork) => {
      const exhibitionId = artwork.exhibitionId || "unknown-exhibition";
      const existing = groups.get(exhibitionId);

      if (existing) {
        existing.artworks.push(artwork);
        return;
      }

      groups.set(exhibitionId, {
        exhibitionId,
        exhibitionTitle: artwork.exhibitionTitle || "Approved Exhibition",
        exhibitionSlug: artwork.exhibitionSlug || null,
        artworks: [artwork],
      });
    });

    return Array.from(groups.values());
  }, [approvedArtworks]);

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

        {portfolioArtworks.length > 0 ? (
          <section className="mt-16 first:mt-0">
            <Reveal>
              <SectionLabel>Public Portfolio</SectionLabel>
            </Reveal>
            <ArtworkPreviewGrid artworks={portfolioArtworks} />
          </section>
        ) : null}

        {approvedArtworks.length > 0 ? (
          <section className="mt-16">
            <Reveal>
              <SectionLabel>Approved Exhibition Works</SectionLabel>
            </Reveal>
            <div className="mt-10 space-y-16">
            {approvedArtworkGroups.map((group, index) => (
              <Reveal key={group.exhibitionId} delay={((index % 3) + 1) as 1 | 2 | 3}>
                <ApprovedExhibitionSection
                  exhibitionId={group.exhibitionId}
                  exhibitionTitle={group.exhibitionTitle}
                  exhibitionSlug={group.exhibitionSlug}
                  artworks={group.artworks}
                />
              </Reveal>
            ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
