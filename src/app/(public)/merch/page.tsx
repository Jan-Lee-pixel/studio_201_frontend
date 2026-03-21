import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MerchCard } from "@/features/merch/components/MerchCard";
import { getPublicMerch } from "./merchData";

export const metadata: Metadata = {
  title: "Merch | Studio 201",
  description: "Editorial merch, editions, and backroom selections from Studio 201.",
};

function normalizeFilter(value?: string): string | null {
  const normalized = (value || "").trim().toLowerCase();
  return normalized || null;
}

function formatItemType(value: string) {
  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function MerchPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const requestedFilter = normalizeFilter(params?.type);
  const items = await getPublicMerch();

  const typeFilters = Array.from(
    items.reduce((summary, item) => {
      const currentCount = summary.get(item.itemType) || 0;
      summary.set(item.itemType, currentCount + 1);
      return summary;
    }, new Map<string, number>()),
  ).sort((a, b) => {
    const typeCompare = formatItemType(a[0]).localeCompare(formatItemType(b[0]));
    return typeCompare !== 0 ? typeCompare : b[1] - a[1];
  });

  const activeFilter = typeFilters.some(([type]) => type.toLowerCase() === requestedFilter) ? requestedFilter : null;
  const filteredItems = activeFilter ? items.filter((item) => item.itemType.toLowerCase() === activeFilter) : items;

  const merchChannelItems = filteredItems.filter((item) => item.channel === "merch");
  const backroomChannelItems = filteredItems.filter((item) => item.channel === "backroom");
  const featuredMerchItems = merchChannelItems.filter((item) => item.isFeatured);
  const leadItem = featuredMerchItems[0] || merchChannelItems[0] || null;
  const supportingFeatured = featuredMerchItems.filter((item) => item.id !== leadItem?.id);
  const merchItems = merchChannelItems.filter((item) => item.id !== leadItem?.id && !item.isFeatured);
  const backroomItems = backroomChannelItems;

  const activeFilterLabel = activeFilter ? formatItemType(activeFilter) : "All Items";
  const catalogLabel = activeFilter ? `${activeFilterLabel.toLowerCase()} item` : "item";

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-28">
      <header className="border-b border-[var(--color-rule)] px-6 pb-14 md:px-12 md:pb-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
          <div>
            <Reveal>
              <SectionLabel>Studio 201 Merch</SectionLabel>
            </Reveal>
            <Reveal>
              <h1 className="font-display text-[clamp(42px,7vw,92px)] leading-[0.92] tracking-[-0.05em] text-[var(--color-near-black)]">
                Merch and
                <br />
                backroom.
              </h1>
            </Reveal>
          </div>
          <div className="space-y-4 lg:pb-3">
            <Reveal delay={1}>
              <p className="text-sm leading-7 text-[var(--color-warm-slate)]">
                A lean catalog of artist editions, clothing, objects, and quieter backroom releases. The flow stays inquiry-first, so the page reads like Studio 201 rather than a conventional shop.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <p className="font-sub text-base italic leading-7 text-[var(--color-dust)]">
                Open any item to ask about availability, pickup, shipping, or price details.
              </p>
            </Reveal>
          </div>
        </div>
      </header>

      <div className="border-b border-[var(--color-rule)] bg-[var(--color-parchment)] px-6 py-4 md:px-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            {leadItem ? (
              <a href="#featured" className="hover:text-[var(--color-near-black)]">
                Featured
              </a>
            ) : null}
            <a href="#catalog" className="hover:text-[var(--color-near-black)]">
              Catalog
            </a>
            <a href="#backroom" className="hover:text-[var(--color-near-black)]">
              Backroom
            </a>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Filter by item type
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                href="/merch"
                className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  !activeFilter
                    ? "border-[var(--color-near-black)] bg-[var(--color-near-black)] text-[var(--color-cream)]"
                    : "border-[var(--color-rule)] text-[var(--color-dust)] hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
                }`}
              >
                All items {items.length}
              </Link>
              {typeFilters.map(([type, count]) => (
                <Link
                  key={type}
                  href={`/merch?type=${encodeURIComponent(type)}`}
                  className={`rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                    activeFilter === type.toLowerCase()
                      ? "border-[var(--color-near-black)] bg-[var(--color-near-black)] text-[var(--color-cream)]"
                      : "border-[var(--color-rule)] text-[var(--color-dust)] hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
                  }`}
                >
                  {formatItemType(type)} {count}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="space-y-24 px-6 py-16 md:px-12 md:py-20">
        {leadItem ? (
          <section id="featured" className="overflow-hidden border border-[var(--color-rule)] bg-white">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,500px)]">
              <Reveal className="h-full">
                <Link href={`/merch/${leadItem.slug}`} className="group block h-full bg-[var(--color-bone)]">
                  <div className="flex min-h-[300px] items-center justify-center p-8 md:min-h-[460px] md:p-12">
                    {leadItem.primaryImageUrl ? (
                      <img
                        src={leadItem.primaryImageUrl}
                        alt={leadItem.title}
                        className="max-h-[280px] w-auto max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02] md:max-h-[400px]"
                      />
                    ) : (
                      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-dust)]">
                        No image yet
                      </div>
                    )}
                  </div>
                </Link>
              </Reveal>

              <Reveal delay={1} className="border-t border-[var(--color-rule)] p-8 lg:border-l lg:border-t-0 lg:p-12">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                      <span>Featured merch</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--color-rule)]" />
                      <span>{formatItemType(leadItem.itemType)}</span>
                    </div>

                    <h2 className="mt-5 font-display text-[clamp(34px,5vw,62px)] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
                      {leadItem.title}
                    </h2>

                    {leadItem.artistName ? (
                      <p className="mt-4 text-sm text-[var(--color-warm-slate)]">{leadItem.artistName}</p>
                    ) : null}

                    {leadItem.shortNote ? (
                      <p className="mt-6 max-w-[36ch] font-sub text-[clamp(20px,2.4vw,28px)] italic font-light leading-[1.5] text-[var(--color-warm-slate)]">
                        {leadItem.shortNote}
                      </p>
                    ) : null}

                    {leadItem.description ? (
                      <p className="mt-6 max-w-[42ch] whitespace-pre-line text-sm leading-8 text-[var(--color-warm-slate)]">
                        {leadItem.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-4 border-t border-[var(--color-rule)] pt-5 sm:grid-cols-2">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Availability</div>
                        <div className="mt-2 text-sm text-[var(--color-near-black)]">Handled by inquiry</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Price note</div>
                        <div className="mt-2 text-sm text-[var(--color-near-black)]">
                          {leadItem.priceLabel || "Available on request"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/merch/${leadItem.slug}`}
                        className="inline-flex items-center justify-center border border-[var(--color-near-black)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
                      >
                        Open item
                      </Link>
                      <a
                        href="#catalog"
                        className="inline-flex items-center justify-center border border-[var(--color-rule)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-dust)] transition-colors duration-300 hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
                      >
                        Browse catalog
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        ) : (
          <section id="featured">
            <Reveal>
              <SectionLabel>Featured</SectionLabel>
            </Reveal>
            <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
              Featured merch is coming soon.
            </div>
          </section>
        )}

        {supportingFeatured.length > 0 ? (
          <section>
            <Reveal>
              <SectionLabel>More featured selections</SectionLabel>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {supportingFeatured.map((item, index) => (
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
          </section>
        ) : null}

        <section id="catalog">
          <Reveal>
            <SectionLabel>Catalog</SectionLabel>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-4 flex flex-col gap-4 border-b border-[var(--color-rule)] pb-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                {merchItems.length} published {catalogLabel}
                {merchItems.length === 1 ? "" : "s"}
              </div>
            </div>
          </Reveal>
          {merchItems.length === 0 ? (
            <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
              {activeFilter ? `No ${activeFilterLabel.toLowerCase()} items are published yet.` : "No merch items published yet."}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {merchItems.map((item, index) => (
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
        </section>

        <section id="backroom">
          <div className="overflow-hidden border border-[var(--color-rule)]">
            <Reveal className="bg-[var(--color-near-black)] px-6 py-10 md:px-10 md:py-12">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
                <div>
                  <SectionLabel className="text-[var(--color-accent-soft)] before:bg-[var(--color-accent-soft)]">
                    Backroom
                  </SectionLabel>
                  <h2 className="mt-0 font-display text-[clamp(30px,4vw,52px)] leading-[1.02] tracking-[-0.04em] text-[var(--color-cream)]">
                    Rarer pieces and quieter releases.
                  </h2>
                </div>
                <p className="text-sm leading-7 text-[rgba(247,244,239,0.68)]">
                  Artist-contributed selections, one-off objects, and lower-profile releases that still stay inside the same inquiry-first system.
                </p>
              </div>
            </Reveal>

            {backroomItems.length === 0 ? (
              <div className="bg-white px-6 py-10 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)] md:px-10">
                {activeFilter ? `No ${activeFilterLabel.toLowerCase()} backroom items are live yet.` : "No backroom items are live yet."}
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-rule)] bg-white">
              {backroomItems.map((item, index) => (
                  <Reveal key={item.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <Link
                      href={`/merch/${item.slug}`}
                      className="grid gap-5 px-6 py-6 transition-colors duration-200 hover:bg-[var(--color-bone)] md:grid-cols-[96px_minmax(0,1fr)_160px] md:items-center md:px-10"
                    >
                      <div className="flex h-20 w-24 items-center justify-center overflow-hidden bg-[var(--color-bone)] p-2">
                        {item.primaryImageUrl ? (
                          <img src={item.primaryImageUrl} alt={item.title} className="max-h-full w-auto max-w-full object-contain" />
                        ) : (
                          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-dust)]">No image</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-[26px] leading-none tracking-[-0.02em] text-[var(--color-near-black)]">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--color-warm-slate)]">
                          {[item.artistName, formatItemType(item.itemType), item.shortNote].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <div className="md:text-right">
                        <div className="font-sub text-lg italic text-[var(--color-near-black)]">
                          {item.priceLabel || "Inquiry only"}
                        </div>
                        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                          Open item
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="border border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-10 md:px-10 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <div className="font-display text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.03em] text-[var(--color-near-black)]">
                Inquiry first, always.
              </div>
              <p className="mt-4 max-w-[620px] text-sm leading-7 text-[var(--color-warm-slate)]">
                Studio 201 does not run this section like a checkout cart. Open an item when you want to ask about availability, shipping, pickup, or final pricing details.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
