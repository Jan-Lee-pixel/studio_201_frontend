'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/animation/Reveal";
import { ArtworkCard } from "@/features/artworks/components/ArtworkCard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { artworkService, PublicArtworkDto } from "@/features/artworks/services/artworkService";

export default function ExhibitionResultPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [artworks, setArtworks] = useState<PublicArtworkDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    exhibitionService.getExhibitionBySlug(slug)
      .then(async (data) => {
        setExhibition(data);
        if (data && data.id) {
          try {
            const fetchedArtworks = await artworkService.getApprovedArtworksByExhibition(data.id);
            setArtworks(fetchedArtworks);
          } catch (e) {
            console.error("Failed to load artworks:", e);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-dm-mono text-gray-500 uppercase tracking-widest text-sm bg-[var(--color-charcoal)]">Loading Exhibition...</div>;
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

  return (
    <div>
      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        <img
          src={exhibition.coverImageUrl || "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1800&q=80"}
          alt={exhibition.title}
          className="w-full h-full object-cover brightness-75"
        />
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
            Artists Group // Studio 201 Collection
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* INTRO */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_480px] gap-12 md:gap-30 py-24 border-b border-[var(--color-rule)]">
          <Reveal className="text-[var(--color-warm-slate)]">
            <h3 className="font-sub italic text-[26px] font-light mb-8 leading-[1.4]">
              Exploring New Horizons in Philippine Arts.
            </h3>
            <p className="text-base leading-[1.75] mb-5">
              {exhibition.description || "The works in this collection represent a curated journey into the depths of identity, space, and contemporary artistic practice."}
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
              Maria Santos
            </div>

            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">
              Medium
            </div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">
              Oil, Mixed Media
            </div>

            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">
              Duration
            </div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">
              Oct 3 – Nov 28, 2025
            </div>

            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">
              Location
            </div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">
              Studio 201 Main Gallery
              <br />
              Cebu, Philippines
            </div>

            <div className="mt-10">
              <Button>Inquire about works</Button>
            </div>
          </Reveal>
        </div>

        {/* PULL QUOTE */}
        <Reveal className="font-sub italic text-[clamp(22px,3vw,32px)] font-light text-[var(--color-warm-slate)] leading-[1.4] py-16 border-y border-[var(--color-rule)] my-12 max-w-[720px] ml-auto">
          The body always knows where home is, even when the mind has learned to
          forget.
        </Reveal>

        {/* ARTWORKS */}
        <div className="py-20">
          <Reveal>
            <h2 className="font-display text-[28px] font-normal mb-12 tracking-[-0.01em]">
              Works in Exhibition
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {artworks.length > 0 ? artworks.map((artwork, i) => (
              <ArtworkCard
                key={artwork.id}
                image={"https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80"} // Use actual artwork URL if provided later
                title={artwork.title}
                meta={artwork.description || "Digital submission"}
                delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
              />
            )) : (
              <div className="col-span-2 text-center py-12 text-gray-500 font-dm-mono text-xs tracking-widest uppercase">
                No artworks have been submitted for this exhibition yet.
              </div>
            )}
          </div>
        </div>

        {/* RELATED ARTISTS */}
        <Reveal className="py-20 border-t border-[var(--color-rule)]">
          <SectionLabel>Artists in this Exhibition</SectionLabel>
          <div className="mt-8">
            <div className="font-display text-[22px] font-normal mb-1.5">
              Maria Santos
            </div>
            <div className="font-mono text-[10px] text-[var(--color-dust)] tracking-[0.08em] mb-4">
              CEBU, PHILIPPINES
            </div>
            <Link
              href="/artists/maria-santos"
              className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-near-black)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
            >
              View full profile →
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
