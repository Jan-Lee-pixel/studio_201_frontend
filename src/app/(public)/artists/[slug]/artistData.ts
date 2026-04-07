import {
  getPublicArtistArtworks as getPublicArtistArtworksData,
  getPublicArtistBySlug as getPublicArtistBySlugData,
  getPublicArtistExhibitions as getPublicArtistExhibitionsData,
  getPublicArtistPortfolioItems as getPublicArtistPortfolioItemsData,
  type PortfolioItem,
  type PublicArtist,
  type PublicArtwork,
  type PublicExhibition,
} from "@/lib/publicData";
export type { PortfolioItem, PublicArtist, PublicArtwork, PublicExhibition } from "@/lib/publicData";

export const getArtist = getPublicArtistBySlugData;
export const getArtistArtworks = getPublicArtistArtworksData;
export const getArtistPortfolioItems = getPublicArtistPortfolioItemsData;
export const getArtistExhibitions = getPublicArtistExhibitionsData;

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
