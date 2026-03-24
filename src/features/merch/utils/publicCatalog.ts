import type { MerchChannel } from "@/features/merch/services/merchService";

export function normalizeCatalogFilter(value?: string): string | null {
  const normalized = (value || "").trim().toLowerCase();
  return normalized || null;
}

export function formatCatalogItemType(value: string) {
  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function sortCatalogItems<
  T extends {
    isFeatured?: boolean;
    sortOrder?: number | null;
    createdAt?: string;
    title?: string;
  },
>(items: T[]) {
  return [...items].sort((left, right) => {
    const featuredCompare = Number(Boolean(right.isFeatured)) - Number(Boolean(left.isFeatured));
    if (featuredCompare !== 0) return featuredCompare;

    const leftSort = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightSort = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (leftSort !== rightSort) return leftSort - rightSort;

    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    if (leftTime !== rightTime) return rightTime - leftTime;

    return (left.title || "").localeCompare(right.title || "");
  });
}

export function getCatalogRoutePrefix(channel: MerchChannel | "merch" | "backroom") {
  return channel === "backroom" ? "/backroom" : "/merch";
}

export function getCatalogItemHref(slug: string, channel: MerchChannel | "merch" | "backroom") {
  return `${getCatalogRoutePrefix(channel)}/${slug}`;
}
