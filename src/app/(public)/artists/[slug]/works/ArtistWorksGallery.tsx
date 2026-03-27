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
      <div className="border-b border-[var(--color-rule)] pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Exhibition
            </div>
            <div className="mt-3">
              {exhibitionHref ? (
                <Link
                  href={exhibitionHref}
                  className="font-display text-[clamp(26px,3vw,38px)] leading-[1.04] tracking-[-0.03em] text-[var(--color-near-black)] transition-colors duration-300 hover:text-[var(--color-sienna)]"
                >
                  {exhibitionTitle}
                </Link>
              ) : (
                <h2 className="font-display text-[clamp(26px,3vw,38px)] leading-[1.04] tracking-[-0.03em] text-[var(--color-near-black)]">
                  {exhibitionTitle}
                </h2>
              )}
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              {artworks.length} work{artworks.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {exhibitionHref ? (
              <Link
                href={exhibitionHref}
                className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-4 text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:border-[var(--color-near-black)]"
              >
                View exhibition
              </Link>
            ) : null}
            {showToggle ? (
              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-transparent px-4 text-[11px] uppercase tracking-[0.12em] text-[var(--color-dust)] transition-colors duration-200 hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
              >
                {isExpanded ? "Show fewer" : `Show ${hiddenCount} more`}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <ArtworkPreviewGrid artworks={visibleArtworks} />
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ec_0%,var(--color-linen)_26%,var(--color-bone)_100%)] px-6 pb-24 pt-24 md:px-12 md:pt-28">
      <div className="max-w-[1240px] mx-auto">
        <div className="border-b border-[var(--color-rule)] pb-6 md:pb-8">
          <Reveal>
            <SectionLabel className="mb-4">All Works</SectionLabel>
          </Reveal>
          <div>
            <Reveal>
              <h1 className="font-display text-[clamp(38px,6vw,68px)] leading-[0.98] tracking-[-0.04em] text-[var(--color-near-black)]">
                {artistName}
              </h1>
            </Reveal>
            <Reveal>
              <p className="mt-3 max-w-[720px] text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-base md:leading-[1.75]">
                Public works connected to the artist profile and current exhibition program. Select any piece to view it in detail.
              </p>
            </Reveal>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 md:mt-6">
            <Reveal>
              <Link
                href={`/artists/${artistSlug}`}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-5 text-sm tracking-[0.04em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)]"
              >
                Back to Artist
              </Link>
            </Reveal>
            <Reveal>
              <Link
                href="/artists"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white/72 px-5 text-sm tracking-[0.04em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-white"
              >
                Browse Artists
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="mt-4">
          <PublicProfileOwnerActions
            artistId={artistId}
            artistSlug={artistSlug}
            compact
            showEditProfile={false}
          />
        </div>

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
              <SectionLabel>Exhibition Works</SectionLabel>
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
