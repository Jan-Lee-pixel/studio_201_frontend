import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArtistCard } from "@/features/artists/components/ArtistCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artists - Studio 201",
  description: "Featured artists at Studio 201 gallery",
};

export default function ArtistsPage() {
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
        {[
          {
            name: "Maria Santos",
            medium: "Painting, Mixed Media",
            image:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
          },
          {
            name: "Jun Manlangit",
            medium: "Sculpture, Installation",
            image:
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
          },
          {
            name: "Elena Yap",
            medium: "Photography, Video",
            image:
              "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
          },
          {
            name: "Carlo Reyes",
            medium: "Drawing, Printmaking",
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
          },
          {
            name: "Ana Buenaventura",
            medium: "Textile, Fiber Arts",
            image:
              "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80",
          },
          {
            name: "Rene Dela Cruz",
            medium: "Ceramics, Earthwork",
            image:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
          },
          {
            name: "Ligaya Ferrer",
            medium: "Performance, Sound",
            image:
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
          },
          {
            name: "Bernard Ong",
            medium: "New Media, Digital",
            image:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
          },
        ].map((artist, i) => (
          <ArtistCard
            key={artist.name}
            slug={artist.name.toLowerCase().replace(/ /g, "-")}
            image={artist.image}
            name={artist.name}
            medium={artist.medium}
            delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
          />
        ))}
      </div>
    </div>
  );
}
