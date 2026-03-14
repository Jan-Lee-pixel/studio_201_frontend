'use client';

import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArtistCard } from "@/features/artists/components/ArtistCard";
import { artistService, PublicUserProfile } from "@/features/artists/services/artistService";
import { useEffect, useState } from "react";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<PublicUserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    artistService.getArtists()
      .then(setArtists)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="pt-32 pb-20 px-6 md:px-12 bg-[var(--color-parchment)] min-h-screen">
      <Reveal>
        <SectionLabel>The Artists</SectionLabel>
      </Reveal>
      <Reveal>
        <h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal leading-[1.1] max-w-[600px] mb-20 tracking-[-0.02em]">
          The artists
          <br />
          of Studio 201
        </h1>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-16">
        {
          loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/70 border border-[var(--color-rule)]" />
                <div className="h-4 bg-white/60 mt-4" />
                <div className="h-3 bg-white/50 mt-2 w-2/3" />
              </div>
            ))
          ) : artists.length === 0 ? (
            <div className="col-span-2 md:col-span-4 text-center py-20 text-gray-500 font-dm-mono text-sm tracking-widest uppercase">
              No Artists Found
            </div>
          ) : (
            artists.map((artist, i) => (
              <ArtistCard
                key={artist.id}
                slug={artist.slug}
                image={artist.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"}
                name={artist.fullName}
                medium="Mixed Media"
                delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
              />
            ))
          )
        }
      </div>
    </div>
  );
}
