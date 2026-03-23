import { getPublicFetchConfig, PUBLIC_API_BASE_URL } from "@/lib/publicApi";

export type PublicArtist = {
  id: string;
  fullName: string;
  slug: string;
  bio?: string;
  profileImageUrl?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
};

export type PublicArtwork = {
  id: string;
  exhibitionId: string;
  exhibitionTitle?: string | null;
  exhibitionSlug?: string | null;
  artistId: string;
  title: string;
  category?: string | null;
  artType?: string | null;
  description?: string | null;
  mediaAssetUrl?: string | null;
  createdAt: string;
};

export type PortfolioItem = {
  id: string;
  artistId: string;
  title: string;
  category?: string | null;
  artType?: string | null;
  description?: string | null;
  year?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  mediaAssetUrl?: string | null;
  createdAt: string;
};

export type PublicExhibition = {
  id: string;
  title: string;
  slug: string;
  startDate?: string | null;
  endDate?: string | null;
};

export async function getArtist(slug: string): Promise<PublicArtist | null> {
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/Profile/artists/${slug}`,
      getPublicFetchConfig({ revalidate: 300, tags: [`artist-${slug}`, "public-artists"] }),
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getArtistArtworks(artistId: string): Promise<PublicArtwork[]> {
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/ArtworkSubmissions/public/artist/${artistId}`,
      getPublicFetchConfig({ revalidate: 300, tags: [`artist-artworks-${artistId}`] }),
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getArtistPortfolioItems(artistId: string): Promise<PortfolioItem[]> {
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/Portfolio/artist/${artistId}`,
      getPublicFetchConfig({ revalidate: 300, tags: [`artist-portfolio-${artistId}`] }),
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getArtistExhibitions(artistId: string): Promise<PublicExhibition[]> {
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/Exhibitions/artist/${artistId}`,
      getPublicFetchConfig({ revalidate: 300, tags: [`artist-exhibitions-${artistId}`] }),
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export function formatExhibitionDate(startDate?: string | null) {
  if (!startDate) return { date: "Date TBA", day: "" };
  const dateObj = new Date(startDate);
  return {
    date: dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
  };
}
