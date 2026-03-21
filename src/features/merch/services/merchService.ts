import { apiClient } from "@/lib/apiClient";

export type MerchItemType =
  | "print"
  | "poster"
  | "zine"
  | "tote"
  | "clothing"
  | "original"
  | "edition"
  | "object";

export type MerchChannel = "merch" | "backroom";
export type MerchStatus = "draft" | "pending" | "approved" | "published" | "hidden" | "sold";
export type MerchVisibility = "public" | "invite_only" | "hidden";

export interface MerchItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortNote?: string | null;
  artistId?: string | null;
  artistName?: string | null;
  itemType: MerchItemType;
  channel: MerchChannel;
  status: MerchStatus;
  visibility: MerchVisibility;
  priceLabel?: string | null;
  inquiryEmail?: string | null;
  primaryMediaId?: string | null;
  primaryImageUrl?: string | null;
  isFeatured: boolean;
  sortOrder?: number | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateMerchItemPayload {
  title: string;
  slug?: string;
  description?: string | null;
  shortNote?: string | null;
  itemType: MerchItemType;
  channel?: MerchChannel | null;
  status?: MerchStatus | null;
  visibility?: MerchVisibility | null;
  priceLabel?: string | null;
  inquiryEmail?: string | null;
  primaryMediaId?: string | null;
  isFeatured?: boolean;
  sortOrder?: number | null;
  artistId?: string | null;
}

export interface MerchQuery {
  channel?: MerchChannel;
  itemType?: MerchItemType;
}

function buildQuery(params?: MerchQuery) {
  const searchParams = new URLSearchParams();
  if (params?.channel) searchParams.set("channel", params.channel);
  if (params?.itemType) searchParams.set("itemType", params.itemType);
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const merchService = {
  async getPublicMerch(params?: MerchQuery): Promise<MerchItem[]> {
    return apiClient<MerchItem[]>(`/Merch${buildQuery(params)}`);
  },
  async getPublicMerchBySlug(slug: string): Promise<MerchItem> {
    return apiClient<MerchItem>(`/Merch/slug/${slug}`);
  },
  async getMyMerch(token?: string): Promise<MerchItem[]> {
    return apiClient<MerchItem[]>("/Merch/me", {}, token);
  },
  async getAdminMerch(token?: string): Promise<MerchItem[]> {
    return apiClient<MerchItem[]>("/Admin/merch", {}, token);
  },
  async createMerchItem(payload: CreateMerchItemPayload, token?: string): Promise<MerchItem> {
    return apiClient<MerchItem>(
      "/Merch",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    );
  },
  async updateMerchItem(id: string, payload: Partial<CreateMerchItemPayload>, token?: string): Promise<MerchItem> {
    return apiClient<MerchItem>(
      `/Merch/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token,
    );
  },
  async deleteMerchItem(id: string, token?: string): Promise<void> {
    await apiClient(`/Merch/${id}`, { method: "DELETE" }, token);
  },
  async submitMerchItem(id: string, token?: string): Promise<MerchItem> {
    return apiClient<MerchItem>(`/Merch/${id}/submit`, { method: "POST" }, token);
  },
};

export const MERCH_ITEM_TYPE_OPTIONS: Array<{ value: MerchItemType; label: string }> = [
  { value: "print", label: "Print" },
  { value: "poster", label: "Poster" },
  { value: "zine", label: "Zine" },
  { value: "tote", label: "Tote Bag" },
  { value: "clothing", label: "Clothing" },
  { value: "original", label: "Original Work" },
  { value: "edition", label: "Edition" },
  { value: "object", label: "Object" },
];

export const MERCH_CHANNEL_OPTIONS: Array<{ value: MerchChannel; label: string }> = [
  { value: "merch", label: "Merch" },
  { value: "backroom", label: "Backroom" },
];

export const MERCH_STATUS_OPTIONS: Array<{ value: MerchStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
  { value: "sold", label: "Sold" },
];

export const MERCH_VISIBILITY_OPTIONS: Array<{ value: MerchVisibility; label: string }> = [
  { value: "public", label: "Public" },
  { value: "invite_only", label: "Invite Only" },
  { value: "hidden", label: "Hidden" },
];
