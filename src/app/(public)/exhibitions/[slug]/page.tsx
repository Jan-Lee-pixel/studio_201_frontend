'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/animation/Reveal";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { artworkService, PublicArtworkDto } from "@/features/artworks/services/artworkService";
import { artistService, PublicUserProfile } from "@/features/artists/services/artistService";
import { PublicPageSkeleton } from "@/components/ui/SkeletonPage";
import { ArtworkLightbox } from "@/features/artworks/components/ArtworkLightbox";

export default function ExhibitionResultPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [artworks, setArtworks] = useState<PublicArtworkDto[]>([]);
  const [artists, setArtists] = useState<PublicUserProfile[]>([]);
  const [artistLookup, setArtistLookup] = useState<Record<string, PublicUserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);
      setArtworks([]);
      setArtists([]);
      setArtistLookup({});
      try {
        const data = await exhibitionService.getExhibitionBySlug(slug);
        setExhibition(data);
        if (data && data.id) {
          const fetchedArtworks = await artworkService.getApprovedArtworksByExhibition(data.id);
          setArtworks(fetchedArtworks);

          if (fetchedArtworks.length > 0) {
            const allArtists = await artistService.getArtists().catch(() => []);
            const lookup = Object.fromEntries(allArtists.map((artist) => [artist.id, artist]));
            const uniqueArtistIds = Array.from(new Set(fetchedArtworks.map((artwork) => artwork.artistId)));
            const exhibitionArtists = uniqueArtistIds
              .map((artistId) => lookup[artistId])
              .filter((artist): artist is PublicUserProfile => Boolean(artist));
            setArtistLookup(lookup);
            setArtists(exhibitionArtists);
          } else {
            setArtists([]);
            setArtistLookup({});
          }
        }
      } catch (e) {
        console.error("Failed to load exhibition:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return <PublicPageSkeleton tone="dark" />;
  }

  if (!exhibition) {
    return <div className="min-h-screen flex items-center justify-center font-dm-mono text-gray-500 uppercase tracking-widest text-sm bg-[var(--color-charcoal)]">Exhibition Not Found</div>;
  }

  // Formatting helpers
  const getDurationString = (start?: string, end?: string) => {
    if (!start) return "Upcoming";
    const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endDate = end ? new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Ongoing";
    return `${startDate} – ${endDate}`;
  };

  const artistNames = artists.map((artist) => artist.fullName);
  const heroArtistLabel =
    artistNames.length > 0
      ? `${artistNames.slice(0, 3).join(" · ")}${artistNames.length > 3 ? ` +${artistNames.length - 3}` : ""}`
      : "Artists to be announced";
  const galleryArtworks = artworks.filter((artwork) => Boolean(artwork.mediaAssetUrl));

  return (
    <div>
      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        {exhibition.coverImageUrl ? (
          <img
            src={exhibition.coverImageUrl}
            alt={exhibition.title}
            className="w-full h-full object-cover brightness-75"
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_top,rgba(181,96,58,0.35),rgba(23,22,15,0.95))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,22,15,0.85)] to-transparent via-transparent via-60%"></div>
        <div className="absolute bottom-20 left-6 right-6 md:left-12 md:right-12 border-t border-[rgba(240,237,229,0.2)] pt-8">
          <div className="flex justify-between items-end mb-4">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-sienna)]">
              Exhibition
            </div>
            <div className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.06em]">
              {getDurationString(exhibition.startDate, exhibition.endDate)}
            </div>
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal tracking-[-0.02em] leading-[1.05] text-[var(--color-cream)] mb-3">
            {exhibition.title}
          </h1>
          <div className="font-sub italic text-xl text-[var(--color-dust)]">
            {heroArtistLabel}
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* INTRO */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_480px] gap-12 md:gap-30 py-24 border-b border-[var(--color-rule)]">
          <Reveal className="text-[var(--color-warm-slate)]">
            <p className="text-base leading-[1.75] mb-5">
              {exhibition.description || "Exhibition details will be announced soon."}
            </p>
            <div className="mt-12">
              <Link
                href="/artists"
                className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-near-black)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
              >
                View our roster of artists →
              </Link>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">
              Artist
            </div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">
              {heroArtistLabel}
            </div>

            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">
              Duration
            </div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">
              {getDurationString(exhibition.startDate, exhibition.endDate)}
            </div>
            {artworks.length > 0 ? (
              <div className="mt-10">
                <Button>Inquire about works</Button>
              </div>
            ) : null}
          </Reveal>
        </div>

        {/* ARTWORKS */}
        <div className="py-20 md:py-24">
          <Reveal>
            <h2 className="mb-12 font-display text-[28px] font-normal tracking-[-0.01em] text-[var(--color-near-black)]">
              Works in Exhibition
            </h2>
          </Reveal>

          {galleryArtworks.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-14 gap-y-18 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-18 lg:gap-y-24">
              {galleryArtworks.map((artwork, index) => (
                <Reveal key={artwork.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
                  <button
                    type="button"
                    onClick={() => setSelectedArtworkIndex(index)}
                    className="group block w-full cursor-zoom-in border-none bg-transparent p-0 text-left"
                    aria-label={`View ${artwork.title}`}
                  >
                    <div className="flex min-h-[220px] items-center justify-center sm:min-h-[260px] md:min-h-[320px]">
                      <img
                        src={artwork.mediaAssetUrl || undefined}
                        alt={artwork.title}
                        className="block h-auto max-h-[420px] w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015]"
                      />
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-dust)]">
              No artworks have been submitted for this exhibition yet.
            </div>
          )}
        </div>

        {/* RELATED ARTISTS */}
        <Reveal className="py-20 border-t border-[var(--color-rule)]">
          <SectionLabel>Artists in this Exhibition</SectionLabel>
          {artists.length === 0 ? (
            <div className="mt-8 text-gray-400 font-mono text-xs uppercase tracking-widest">
              No artists have been published for this exhibition yet.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              {artists.map((artist) => (
                <div key={artist.id}>
                  <div className="font-display text-[22px] font-normal mb-1.5">
                    {artist.fullName}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--color-dust)] tracking-[0.08em] mb-4">
                    ARTIST
                  </div>
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-near-black)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
                  >
                    View full profile →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Reveal>
      </div>

      {selectedArtworkIndex !== null ? (
        <ArtworkLightbox
          artworks={galleryArtworks.map((artwork) => ({
            id: artwork.id,
            imageUrl: artwork.mediaAssetUrl as string,
            title: artwork.title,
            artistName: artistLookup[artwork.artistId]?.fullName,
            category: artwork.category,
            artType: artwork.artType,
            description: artwork.description,
          }))}
          initialIndex={selectedArtworkIndex}
          onClose={() => setSelectedArtworkIndex(null)}
        />
      ) : null}
    </div>
  );
}
