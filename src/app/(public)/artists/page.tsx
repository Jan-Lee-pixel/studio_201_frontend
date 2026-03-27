import { PublicCatalogHeader, PublicEmptyState } from "@/components/ui/PublicPagePrimitives";
import { ArtistCard } from "@/features/artists/components/ArtistCard";
import { sortPublicArtists, type PublicUserProfile } from "@/features/artists/services/artistService";
import { getPublicCollection } from "@/lib/publicApi";

export default async function ArtistsPage() {
  const artistsData = await getPublicCollection<PublicUserProfile>("/Profile/artists", {
    revalidate: 300,
    tags: ["public-artists"],
  });
  const artists = sortPublicArtists(artistsData);

  return (
    <div className="bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_35%,var(--color-bone)_100%)]">
      <PublicCatalogHeader
        title="Artists"
        description="Browse the public roster in the order set by the gallery program."
        meta={`${artists.length} artist${artists.length === 1 ? "" : "s"} in the roster`}
      />

      <section className="px-6 pb-16 pt-2 md:px-12 md:pb-24 md:pt-4">
        <div className="mx-auto max-w-[1440px]">
          {artists.length === 0 ? (
            <PublicEmptyState
              title="No artists yet"
              description="Approved artist profiles will appear here once they are ready for the public roster."
            />
          ) : (
            <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-5 lg:gap-y-10 xl:grid-cols-4">
              {artists.map((artist, index) => (
                <ArtistCard
                  key={artist.id}
                  slug={artist.slug}
                  image={artist.profileImageUrl || null}
                  name={artist.fullName}
                  delay={((index % 4) + 1) as 1 | 2 | 3 | 4}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
