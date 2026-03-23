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

const API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5203/api";

function buildQuery(params?: { channel?: string; itemType?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.channel) searchParams.set("channel", params.channel);
  if (params?.itemType) searchParams.set("itemType", params.itemType);
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getPublicMerch(params?: { channel?: string; itemType?: string }): Promise<PublicMerchItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/Merch${buildQuery(params)}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getPublicMerchBySlug(slug: string): Promise<PublicMerchItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/Merch/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
