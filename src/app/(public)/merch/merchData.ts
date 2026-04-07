import {
  getPublicMerchItemBySlug as getPublicMerchItemBySlugData,
  getPublicMerchItems as getPublicMerchItemsData,
} from "@/lib/publicData";

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

export async function getPublicMerch(params?: { channel?: string; itemType?: string }): Promise<PublicMerchItem[]> {
  return getPublicMerchItemsData(params);
}

export async function getPublicMerchBySlug(slug: string): Promise<PublicMerchItem | null> {
  return getPublicMerchItemBySlugData(slug);
}
