import { getPublicFetchConfig, PUBLIC_API_BASE_URL } from "@/lib/publicApi";

export type PublicMerchItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortNote?: string | null;
  artistId?: string | null;
  artistName?: string | null;
  itemType: string;
  channel: "merch" | "backroom";
  status: string;
  visibility: string;
  priceLabel?: string | null;
  inquiryEmail?: string | null;
  primaryMediaId?: string | null;
  primaryImageUrl?: string | null;
  secondaryMediaId?: string | null;
  secondaryImageUrl?: string | null;
  tertiaryMediaId?: string | null;
  tertiaryImageUrl?: string | null;
  galleryImages?: string[];
  isFeatured: boolean;
  sortOrder?: number | null;
  createdAt: string;
  updatedAt?: string | null;
};

function buildQuery(params?: { channel?: string; itemType?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.channel) searchParams.set("channel", params.channel);
  if (params?.itemType) searchParams.set("itemType", params.itemType);
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getPublicMerch(params?: { channel?: string; itemType?: string }): Promise<PublicMerchItem[]> {
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/Merch${buildQuery(params)}`,
      getPublicFetchConfig({ revalidate: 300, tags: ["public-merch"] }),
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPublicMerchBySlug(slug: string): Promise<PublicMerchItem | null> {
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/Merch/slug/${slug}`,
      getPublicFetchConfig({ revalidate: 300, tags: [`merch-${slug}`, "public-merch"] }),
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
