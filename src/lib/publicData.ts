import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { sortPublicArtists, type PublicUserProfile } from "@/features/artists/services/artistService";
import type { PublicArtworkDto } from "@/features/artworks/services/artworkService";
import type { EventDto } from "@/features/events/services/eventService";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import type { PublicMerchItem } from "@/app/(public)/merch/merchData";

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
  description?: string | null;
  coverImageUrl?: string | null;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_PUBLIC_READ_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isProduction = process.env.NODE_ENV === "production";

type PublicMediaRelation = {
  public_url?: string | null;
} | null;

type PublicArtistRow = {
  id: string;
  email: string;
  full_name: string;
  slug?: string | null;
  role?: string | null;
  account_status?: string | null;
  artist_rank?: number | null;
  bio?: string | null;
  profile_image_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  created_at: string;
};

type ExhibitionRow = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_featured?: boolean | null;
  cover_media_id?: string | null;
  cover_media?: PublicMediaRelation;
};

type EventRow = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  venue?: string | null;
  time_label?: string | null;
  is_external?: boolean | null;
  has_documentation?: boolean | null;
  is_published?: boolean | null;
  cover_media_id?: string | null;
  cover_media?: PublicMediaRelation;
};

type ArtworkSubmissionRow = {
  id: string;
  exhibition_id: string;
  artist_id: string;
  title: string;
  category?: string | null;
  art_type?: string | null;
  description?: string | null;
  status: string;
  is_visible_in_exhibition?: boolean | null;
  display_order?: number | null;
  media_asset_id?: string | null;
  created_at: string;
  media_asset?: PublicMediaRelation;
  exhibition?: {
    title?: string | null;
    slug?: string | null;
  } | null;
};

type PortfolioItemRow = {
  id: string;
  artist_id: string;
  title: string;
  category?: string | null;
  art_type?: string | null;
  description?: string | null;
  year?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  is_public?: boolean | null;
  created_at: string;
  media_asset?: PublicMediaRelation;
};

type MerchItemRow = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  short_note?: string | null;
  artist_id?: string | null;
  item_type: string;
  channel: "merch" | "backroom";
  status: string;
  visibility: string;
  price_label?: string | null;
  inquiry_email?: string | null;
  primary_media_id?: string | null;
  secondary_media_id?: string | null;
  tertiary_media_id?: string | null;
  primary_media?: PublicMediaRelation;
  secondary_media?: PublicMediaRelation;
  tertiary_media?: PublicMediaRelation;
  artist?: {
    full_name?: string | null;
  } | null;
  is_featured?: boolean | null;
  sort_order?: number | null;
  created_at: string;
  updated_at?: string | null;
};

function createPublicDataClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLIC_READ_KEY) {
    throw new Error("Missing Supabase public data environment configuration.");
  }

  return createClient(SUPABASE_URL, SUPABASE_PUBLIC_READ_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function withPublicCache<T>(keyParts: string[], revalidate: number, load: () => Promise<T>) {
  if (!isProduction) {
    return load();
  }

  return unstable_cache(load, keyParts, { revalidate })();
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function isPublicArtist(row: PublicArtistRow) {
  const role = (row.role || "").trim().toLowerCase();
  const accountStatus = (row.account_status || "").trim().toLowerCase();
  return role === "artist" || (accountStatus === "approved" && !role);
}

function mapArtistRow(row: PublicArtistRow): PublicUserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    slug: row.slug?.trim() || slugifyValue(row.full_name),
    role: row.role?.trim() || "artist",
    artistRank: row.artist_rank ?? null,
    bio: row.bio?.trim() || "",
    profileImageUrl: row.profile_image_url?.trim() || undefined,
    instagramUrl: row.instagram_url?.trim() || null,
    facebookUrl: row.facebook_url?.trim() || null,
    youtubeUrl: row.youtube_url?.trim() || null,
    createdAt: row.created_at,
  };
}

function mapExhibitionRow(row: ExhibitionRow): Exhibition {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description?.trim() || "",
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    isFeatured: Boolean(row.is_featured),
    coverMediaId: row.cover_media_id ?? null,
    coverImageUrl: row.cover_media?.public_url || undefined,
  };
}

function mapEventRow(row: EventRow): EventDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle?.trim() || "",
    description: row.description?.trim() || "",
    type: row.type?.trim() || "",
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    venue: row.venue?.trim() || "",
    timeLabel: row.time_label?.trim() || "",
    isExternal: Boolean(row.is_external),
    hasDocumentation: Boolean(row.has_documentation),
    isPublished: row.is_published ?? true,
    coverMediaId: row.cover_media_id ?? null,
    coverImageUrl: row.cover_media?.public_url || null,
  };
}

function mapArtistArtworkRow(row: ArtworkSubmissionRow): PublicArtwork {
  return {
    id: row.id,
    exhibitionId: row.exhibition_id,
    exhibitionTitle: row.exhibition?.title || null,
    exhibitionSlug: row.exhibition?.slug || null,
    artistId: row.artist_id,
    title: row.title,
    category: row.category ?? null,
    artType: row.art_type ?? null,
    description: row.description ?? null,
    mediaAssetUrl: row.media_asset?.public_url || null,
    createdAt: row.created_at,
  };
}

function mapExhibitionArtworkRow(row: ArtworkSubmissionRow): PublicArtworkDto {
  return {
    id: row.id,
    exhibitionId: row.exhibition_id,
    artistId: row.artist_id,
    title: row.title,
    category: row.category ?? null,
    artType: row.art_type ?? null,
    description: row.description || "",
    status: row.status,
    isVisibleInExhibition: row.is_visible_in_exhibition ?? true,
    displayOrder: row.display_order ?? null,
    mediaAssetId: row.media_asset_id ?? null,
    mediaAssetUrl: row.media_asset?.public_url || null,
    createdAt: row.created_at,
  };
}

function mapPortfolioItemRow(row: PortfolioItemRow): PortfolioItem {
  return {
    id: row.id,
    artistId: row.artist_id,
    title: row.title,
    category: row.category ?? null,
    artType: row.art_type ?? null,
    description: row.description ?? null,
    year: row.year ?? null,
    medium: row.medium ?? null,
    dimensions: row.dimensions ?? null,
    mediaAssetUrl: row.media_asset?.public_url || null,
    createdAt: row.created_at,
  };
}

function mapMerchItemRow(row: MerchItemRow): PublicMerchItem {
  const galleryImages = [
    row.primary_media?.public_url,
    row.secondary_media?.public_url,
    row.tertiary_media?.public_url,
  ].filter((value): value is string => Boolean(value));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? null,
    shortNote: row.short_note ?? null,
    artistId: row.artist_id ?? null,
    artistName: row.artist?.full_name ?? null,
    itemType: row.item_type,
    channel: row.channel,
    status: row.status,
    visibility: row.visibility,
    priceLabel: row.price_label ?? null,
    inquiryEmail: row.inquiry_email ?? null,
    primaryMediaId: row.primary_media_id ?? null,
    primaryImageUrl: row.primary_media?.public_url ?? null,
    secondaryMediaId: row.secondary_media_id ?? null,
    secondaryImageUrl: row.secondary_media?.public_url ?? null,
    tertiaryMediaId: row.tertiary_media_id ?? null,
    tertiaryImageUrl: row.tertiary_media?.public_url ?? null,
    galleryImages,
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function queryPublicArtists() {
  const client = createPublicDataClient();
  const { data, error } = await client
    .from("users")
    .select(
      "id,email,full_name,slug,role,account_status,artist_rank,bio,profile_image_url,instagram_url,facebook_url,youtube_url,created_at",
    )
    .or("role.eq.artist,account_status.eq.approved")
    .order("artist_rank", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return sortPublicArtists(((data || []) as PublicArtistRow[]).filter(isPublicArtist).map(mapArtistRow));
}

async function queryAllExhibitions() {
  const client = createPublicDataClient();
  const { data, error } = await client
    .from("exhibitions")
    .select(
      "id,title,slug,description,start_date,end_date,is_featured,cover_media_id,cover_media:cover_media_id(public_url)",
    )
    .order("start_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data || []) as ExhibitionRow[]).map(mapExhibitionRow);
}

async function queryPublicEvents() {
  const client = createPublicDataClient();
  const { data, error } = await client
    .from("events")
    .select(
      "id,title,slug,subtitle,description,type,start_date,end_date,venue,time_label,is_external,has_documentation,is_published,cover_media_id,cover_media:cover_media_id(public_url)",
    )
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) throw error;

  return ((data || []) as EventRow[])
    .filter((event) => event.is_published !== false)
    .map(mapEventRow);
}

async function queryPublicArtworksByArtist(artistId: string) {
  const client = createPublicDataClient();
  const { data, error } = await client
    .from("artwork_submissions")
    .select(
      "id,exhibition_id,artist_id,title,category,art_type,description,status,created_at,media_asset_id,media_asset:media_asset_id(public_url),exhibition:exhibition_id(title,slug)",
    )
    .eq("artist_id", artistId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data || []) as ArtworkSubmissionRow[]).map(mapArtistArtworkRow);
}

async function queryPublicPortfolioByArtist(artistId: string) {
  const client = createPublicDataClient();
  const { data, error } = await client
    .from("artist_portfolio_items")
    .select(
      "id,artist_id,title,category,art_type,description,year,medium,dimensions,is_public,created_at,media_asset:media_asset_id(public_url)",
    )
    .eq("artist_id", artistId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data || []) as PortfolioItemRow[]).map(mapPortfolioItemRow);
}

async function queryPublicExhibitionArtworks(exhibitionId: string) {
  const client = createPublicDataClient();
  const { data, error } = await client
    .from("artwork_submissions")
    .select(
      "id,exhibition_id,artist_id,title,category,art_type,description,status,is_visible_in_exhibition,display_order,media_asset_id,created_at,media_asset:media_asset_id(public_url)",
    )
    .eq("exhibition_id", exhibitionId)
    .eq("status", "approved")
    .eq("is_visible_in_exhibition", true)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data || []) as ArtworkSubmissionRow[]).map(mapExhibitionArtworkRow);
}

async function queryPublicMerch(params?: { channel?: string; itemType?: string }) {
  const client = createPublicDataClient();
  let query = client
    .from("merch_items")
    .select(
      "id,title,slug,description,short_note,artist_id,item_type,channel,status,visibility,price_label,inquiry_email,primary_media_id,secondary_media_id,tertiary_media_id,primary_media:primary_media_id(public_url),secondary_media:secondary_media_id(public_url),tertiary_media:tertiary_media_id(public_url),artist:artist_id(full_name),is_featured,sort_order,created_at,updated_at",
    )
    .eq("status", "published")
    .eq("visibility", "public")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (params?.channel) {
    query = query.eq("channel", params.channel);
  }

  if (params?.itemType) {
    query = query.eq("item_type", params.itemType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data || []) as MerchItemRow[]).map(mapMerchItemRow);
}

async function queryPublicMerchBySlug(slug: string) {
  const client = createPublicDataClient();
  const { data, error } = await client
    .from("merch_items")
    .select(
      "id,title,slug,description,short_note,artist_id,item_type,channel,status,visibility,price_label,inquiry_email,primary_media_id,secondary_media_id,tertiary_media_id,primary_media:primary_media_id(public_url),secondary_media:secondary_media_id(public_url),tertiary_media:tertiary_media_id(public_url),artist:artist_id(full_name),is_featured,sort_order,created_at,updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error) throw error;
  return data ? mapMerchItemRow(data as MerchItemRow) : null;
}

export async function getPublicArtists() {
  return withPublicCache(["public-artists"], 300, queryPublicArtists);
}

export async function getPublicArtistBySlug(slug: string): Promise<PublicArtist | null> {
  const normalizedTarget = slugifyValue(slug);
  const artists = await getPublicArtists();
  return (
    artists.find((artist) => {
      const artistSlug = slugifyValue(artist.slug || "");
      return artistSlug === normalizedTarget || slugifyValue(artist.fullName) === normalizedTarget;
    }) || null
  );
}

export async function getAllPublicExhibitions() {
  return withPublicCache(["public-exhibitions-all"], 60, queryAllExhibitions);
}

export async function getProgramExhibitions() {
  const today = todayIsoDate();
  const exhibitions = await getAllPublicExhibitions();
  return exhibitions.filter((exhibition) => {
    if (!exhibition.startDate) return false;
    if (exhibition.startDate > today) return true;
    return !exhibition.endDate || exhibition.endDate >= today;
  });
}

export async function getArchiveExhibitions() {
  const today = todayIsoDate();
  const exhibitions = await getAllPublicExhibitions();
  return exhibitions
    .filter((exhibition) => Boolean(exhibition.endDate && exhibition.endDate < today))
    .sort((left, right) => {
      const leftTime = left.endDate ? new Date(left.endDate).getTime() : 0;
      const rightTime = right.endDate ? new Date(right.endDate).getTime() : 0;
      return rightTime - leftTime;
    });
}

export async function getOpenExhibitions() {
  const today = todayIsoDate();
  const exhibitions = await getAllPublicExhibitions();
  return exhibitions
    .filter((exhibition) => !exhibition.endDate || exhibition.endDate >= today)
    .sort((left, right) => {
      const leftTime = left.startDate ? new Date(left.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightTime = right.startDate ? new Date(right.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime;
    });
}

export async function getPublicExhibitionBySlug(slug: string) {
  const exhibitions = await getAllPublicExhibitions();
  return exhibitions.find((exhibition) => exhibition.slug === slug) || null;
}

export async function getPublicEvents() {
  return withPublicCache(["public-events"], 300, queryPublicEvents);
}

export async function getPublicEventBySlug(slug: string) {
  const events = await getPublicEvents();
  return events.find((event) => event.slug === slug) || null;
}

export async function getPublicArtistArtworks(artistId: string) {
  return withPublicCache(["public-artist-artworks", artistId], 300, () =>
    queryPublicArtworksByArtist(artistId),
  );
}

export async function getPublicArtistPortfolioItems(artistId: string) {
  return withPublicCache(["public-artist-portfolio", artistId], 300, () =>
    queryPublicPortfolioByArtist(artistId),
  );
}

export async function getPublicArtistExhibitions(artistId: string): Promise<PublicExhibition[]> {
  const today = todayIsoDate();
  const [exhibitions, artworks] = await Promise.all([
    getAllPublicExhibitions(),
    getPublicArtistArtworks(artistId),
  ]);
  const exhibitionIds = new Set(artworks.map((artwork) => artwork.exhibitionId));

  return exhibitions
    .filter((exhibition) => exhibitionIds.has(exhibition.id))
    .filter((exhibition) => !exhibition.endDate || exhibition.endDate >= today)
    .sort((left, right) => {
      const leftTime = left.startDate ? new Date(left.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightTime = right.startDate ? new Date(right.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime;
    }) as PublicExhibition[];
}

export async function getPublicExhibitionArtworks(exhibitionId: string) {
  return withPublicCache(["public-exhibition-artworks", exhibitionId], 60, () =>
    queryPublicExhibitionArtworks(exhibitionId),
  );
}

export async function getPublicMerchItems(params?: { channel?: string; itemType?: string }) {
  const cacheKey = ["public-merch", params?.channel || "all", params?.itemType || "all"];
  return withPublicCache(cacheKey, 300, () => queryPublicMerch(params));
}

export async function getPublicMerchItemBySlug(slug: string) {
  return withPublicCache(["public-merch-slug", slug], 300, () => queryPublicMerchBySlug(slug));
}
