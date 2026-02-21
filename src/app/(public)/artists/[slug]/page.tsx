import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/animation/Reveal";
import { ArtworkCard } from "@/features/artworks/components/ArtworkCard";
import { EventRow } from "@/features/events/components/EventRow";

import { Metadata } from "next";

// dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  // fetch artist name:
  const artistName = "Janlie Pisot";
  const description = "lorem ipsum";
  return {
    title: `${artistName} - Studio 201`,
    description: `${description}`,
  };
}

export default function ArtistProfilePage() {
  return (
    <div className="pt-20">
      {/* HERO */}
      <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] min-h-screen">
        <div className="relative h-[60vh] md:h-screen md:sticky md:top-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
            alt="Maria Santos"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-20 flex flex-col justify-end">
          <Reveal>
            <h1 className="font-display text-[clamp(36px,5vw,60px)] font-normal tracking-[-0.02em] leading-[1.1] mb-3 text-[var(--color-near-black)]">
              Maria
              <br />
              Santos
            </h1>
            <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-dust)] uppercase mb-12">
              Cebu, Philippines · b. 1986
            </div>

            <p className="font-sub italic text-xl font-light text-[var(--color-warm-slate)] leading-[1.6] mb-8">
              Santos works at the intersection of memory, myth, and the
              landscapes of Southern Philippines — translating displacement into
              large-format oil paintings that feel both intimate and immense.
            </p>

            <p className="text-base leading-[1.75] text-[var(--color-warm-slate)] max-w-[540px] mb-6">
              Her practice has expanded over the past decade to include found
              materials: scorched cloth, earth from specific sites, abaca fiber
              woven into paint surfaces. Each work is both document and dream,
              rooted in the geography of the Visayas while reaching toward
              something universal and wordless.
            </p>

            <p className="text-base leading-[1.75] text-[var(--color-warm-slate)] max-w-[540px]">
              Santos has exhibited across the Philippines and Southeast Asia.
              She maintains a studio in Carcar, Cebu.
            </p>

            <div className="mt-12 flex gap-8 items-center">
              <Button>Download CV</Button>
              <a
                href="#"
                className="relative inline-block font-body text-[13px] text-[var(--color-warm-slate)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
              >
                Instagram →
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* SELECTED WORKS */}
      <div className="py-24 px-6 md:px-12 bg-[var(--color-linen)]">
        <Reveal>
          <SectionLabel>Selected Works</SectionLabel>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
          <ArtworkCard
            image="https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80"
            title="Ang Paa na Hindi Lumupad, I"
            meta="2025 · Oil on canvas"
            delay={1}
          />
          <ArtworkCard
            image="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80"
            title="Dagat na Walang Hangganan"
            meta="2024 · Oil, earth, cloth"
            delay={2}
          />
          <ArtworkCard
            image="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80"
            title="Langit ng Aking Ina"
            meta="2025 · Oil on linen"
            delay={3}
          />
          <ArtworkCard
            image="https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&q=80"
            title="Halina at Luha"
            meta="2023 · Mixed media"
            delay={1}
          />
          <ArtworkCard
            image="https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=600&q=80"
            title="Ang Katahimikan ng Tubig"
            meta="2022 · Oil on canvas"
            delay={2}
          />
          <ArtworkCard
            image="https://images.unsplash.com/photo-1590907047706-ee9c08cf3189?w=600&q=80"
            title="Bundok at Dagat"
            meta="2022 · Oil, abaca"
            delay={3}
          />
        </div>
      </div>

      {/* UPCOMING SHOWS */}
      <div className="py-20 px-6 md:px-12 max-w-[900px]">
        <Reveal>
          <SectionLabel>Upcoming Shows</SectionLabel>
        </Reveal>
        <div className="mt-12">
          <EventRow
            date="Nov 30, 2025"
            day=""
            type="Studio 201 Exhibition"
            title="Mga Paa sa Alapaap"
            subtitle=""
            venue="Studio 201 · Cebu, Philippines"
            time=""
            delay={1}
          />
          <EventRow
            date="Jan 10, 2026"
            day=""
            type="External · Group Show"
            title="Visayan Contemporary"
            subtitle=""
            venue="Ayala Museum · Manila, Philippines"
            time=""
            isExternal
            delay={2}
          />
          <EventRow
            date="Mar 15, 2026"
            day=""
            type="External · Solo"
            title="Roots and Routes"
            subtitle=""
            venue="Art Fair Singapore"
            time=""
            isExternal
            delay={3}
          />
        </div>
      </div>
    </div>
  );
}
