import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArtistCard } from "@/features/artists/components/ArtistCard";
import type { PublicUserProfile } from "@/features/artists/services/artistService";
import { getPublicCollection } from "@/lib/publicApi";

export default async function ArtistsPage() {
  const artists = await getPublicCollection<PublicUserProfile>("/Profile/artists", {
    revalidate: 300,
    tags: ["public-artists"],
  });
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
        {artists.length === 0 ? (
            <div className="col-span-2 md:col-span-4 text-center py-20 text-gray-500 font-dm-mono text-sm tracking-widest uppercase">
              No Artists Found
            </div>
          ) : (
            artists.map((artist, i) => (
              <ArtistCard
                key={artist.id}
                slug={artist.slug}
                image={artist.profileImageUrl || null}
                name={artist.fullName}
                medium=""
                delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
              />
            ))
          )}
      </div>
    </div>
  );
}
