import type { Metadata } from "next";
import Link from "next/link";
import { PublicCatalogHeader, PublicEmptyState } from "@/components/ui/PublicPagePrimitives";
import { MerchCard } from "@/features/merch/components/MerchCard";
import {
  formatCatalogItemType,
  normalizeCatalogFilter,
  sortCatalogItems,
} from "@/features/merch/utils/publicCatalog";
import { getPublicMerch } from "./merchData";

export const metadata: Metadata = {
  title: "Merch | Studio 201",
  description: "Public releases from Studio 201.",
};

export default async function MerchPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const requestedFilter = normalizeCatalogFilter(params?.type);
  const allItems = sortCatalogItems(await getPublicMerch({ channel: "merch" }));

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
      <PublicCatalogHeader
        title="Merch"
        description="Public releases, apparel, objects, and printed matter from Studio 201."
        meta={`${allItems.length} published item${allItems.length === 1 ? "" : "s"}`}
      >
        {typeFilters.length > 0 ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
            <Link
              href="/merch"
              className={`shrink-0 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 ${
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
                href={`/merch?type=${encodeURIComponent(type)}`}
                className={`shrink-0 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 ${
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
      </PublicCatalogHeader>

      <section className="px-6 pb-16 md:px-12 md:pb-24">
        <div className="mx-auto max-w-[1440px]">

          {filteredItems.length === 0 ? (
            <PublicEmptyState
              title={allItems.length === 0 ? "No merch items yet" : `No ${activeFilterLabel.toLowerCase()} items yet`}
              description={
                allItems.length === 0
                  ? "Published merch releases will appear here once they are added to the public catalog."
                  : `There are no ${activeFilterLabel.toLowerCase()} merch items in the public catalog yet.`
              }
              className="mt-8"
            />
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 md:gap-4 xl:grid-cols-4">
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
