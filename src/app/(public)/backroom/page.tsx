import type { Metadata } from "next";
import Link from "next/link";
import { PublicEmptyState, PublicPageHeader } from "@/components/ui/PublicPagePrimitives";
import { MerchCard } from "@/features/merch/components/MerchCard";
import {
  formatCatalogItemType,
  normalizeCatalogFilter,
  sortCatalogItems,
} from "@/features/merch/utils/publicCatalog";
import { getPublicMerch } from "../merch/merchData";

export const metadata: Metadata = {
  title: "Backroom | Studio 201",
  description: "Rarer and quieter inquiry-first selections from Studio 201.",
};

export default async function BackroomPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const requestedFilter = normalizeCatalogFilter(params?.type);
  const allItems = sortCatalogItems(await getPublicMerch({ channel: "backroom" }));

  const typeFilters = Array.from(
    allItems.reduce((summary, item) => {
      const currentCount = summary.get(item.itemType) || 0;
      summary.set(item.itemType, currentCount + 1);
      return summary;
    }, new Map<string, number>()),
  ).sort((a, b) => {
    const typeCompare = formatCatalogItemType(a[0]).localeCompare(formatCatalogItemType(b[0]));
    return typeCompare !== 0 ? typeCompare : b[1] - a[1];
  });

  const activeFilter = typeFilters.some(([type]) => type.toLowerCase() === requestedFilter) ? requestedFilter : null;
  const filteredItems = activeFilter ? allItems.filter((item) => item.itemType.toLowerCase() === activeFilter) : allItems;
  const activeFilterLabel = activeFilter ? formatCatalogItemType(activeFilter) : "All Items";

  return (
    <div className="bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_36%,var(--color-bone)_100%)]">
      <PublicPageHeader
        section="Backroom"
        title="Backroom"
        description="One-off objects, quieter releases, and lower-profile items outside the main merch page."
        stats={[
          { label: "Items", value: `${allItems.length} published` },
          { label: "Scope", value: "Backroom releases" },
        ]}
      >
        {typeFilters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/backroom"
              className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                !activeFilter
                  ? "border-[var(--color-near-black)] bg-[var(--color-near-black)] text-[var(--color-cream)]"
                  : "border-[var(--color-rule)] text-[var(--color-dust)] hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
              }`}
            >
              All items {allItems.length}
            </Link>
            {typeFilters.map(([type, count]) => (
              <Link
                key={type}
                href={`/backroom?type=${encodeURIComponent(type)}`}
                className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  activeFilter === type.toLowerCase()
                    ? "border-[var(--color-near-black)] bg-[var(--color-near-black)] text-[var(--color-cream)]"
                    : "border-[var(--color-rule)] text-[var(--color-dust)] hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
                }`}
              >
                {formatCatalogItemType(type)} {count}
              </Link>
            ))}
          </div>
        ) : null}
      </PublicPageHeader>

      <section className="px-6 pb-16 pt-2 md:px-12 md:pb-24 md:pt-4">
        <div className="mx-auto max-w-[1440px]">
          {filteredItems.length === 0 ? (
            <PublicEmptyState
              title={allItems.length === 0 ? "No backroom items yet" : `No ${activeFilterLabel.toLowerCase()} items yet`}
              description={
                allItems.length === 0
                  ? "Backroom releases will appear here once they are approved and published."
                  : `There are no ${activeFilterLabel.toLowerCase()} backroom items in the public catalog yet.`
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {filteredItems.map((item, index) => (
                <MerchCard
                  key={item.id}
                  slug={item.slug}
                  title={item.title}
                  itemType={item.itemType}
                  artistName={item.artistName}
                  shortNote={item.shortNote}
                  priceLabel={item.priceLabel}
                  channel={item.channel}
                  image={item.primaryImageUrl}
                  delay={((index % 3) + 1) as 1 | 2 | 3}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
