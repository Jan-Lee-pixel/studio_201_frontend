import { Metadata } from "next";
import { ArtistWorksGallery } from "./ArtistWorksGallery";
import {
  getArtist,
  getArtistArtworks,
  getArtistPortfolioItems,
} from "../artistData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) {
    return { title: "Artist Works - Studio 201" };
  }
  return {
    title: `${artist.fullName} Works - Studio 201`,
    description: `Browse all public works currently shown for ${artist.fullName}.`,
  };
}

export default async function ArtistWorksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtist(slug);

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center font-dm-mono text-gray-500 uppercase tracking-widest text-sm bg-[var(--color-charcoal)]">
        Artist Not Found
      </div>
    );
  }

  const [portfolioItems, artworks] = await Promise.all([
    getArtistPortfolioItems(artist.id),
    getArtistArtworks(artist.id),
  ]);

  const portfolioPublicItems = portfolioItems
    .filter((item) => Boolean(item.mediaAssetUrl))
    .map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.mediaAssetUrl as string,
      category: item.category,
      artType: item.artType,
      description:
        [item.year, item.medium, item.dimensions, item.description].filter(Boolean).join(" · ") ||
        "Public portfolio work",
      artistName: artist.fullName,
    }));

  const approvedSubmissionWorks = artworks
    .filter((artwork) => Boolean(artwork.mediaAssetUrl))
    .map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      imageUrl: artwork.mediaAssetUrl as string,
      category: artwork.category,
      artType: artwork.artType,
      description: artwork.description || "Approved exhibition work",
      artistName: artist.fullName,
    }));

  return (
    <ArtistWorksGallery
      artistName={artist.fullName}
      artistSlug={artist.slug}
      artistId={artist.id}
      portfolioArtworks={portfolioPublicItems}
      approvedArtworks={approvedSubmissionWorks}
    />
  );
}
