import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  PublicActionLink,
  PublicEmptyState,
  PublicSurface,
} from "@/components/ui/PublicPagePrimitives";
import { ExhibitionCoverFrame } from "@/features/exhibitions/components/ExhibitionCoverFrame";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { getPublicCollection } from "@/lib/publicApi";

function formatYear(exhibition: Exhibition) {
  if (exhibition.endDate) return new Date(exhibition.endDate).getFullYear().toString();
  if (exhibition.startDate) return new Date(exhibition.startDate).getFullYear().toString();
  return "Archive";
}

function formatDateRange(start?: string, end?: string) {
  if (!start) return "Dates to be announced";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!endDate) return startLabel;

  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} - ${endLabel}`;
}

export default async function ArchivePage() {
  const archiveExhibitions = await getPublicCollection<Exhibition>("/Exhibitions/archive", {
    revalidate: 600,
    tags: ["public-archive"],
  });

  const archiveByYear = archiveExhibitions.reduce<Record<string, Exhibition[]>>((acc, exhibition) => {
    const year = formatYear(exhibition);
    acc[year] = [...(acc[year] || []), exhibition];
    return acc;
  }, {});

  const years = Object.keys(archiveByYear).sort((a, b) => Number(b) - Number(a));
  const leadYear = years[0];
  const leadYearItems = leadYear ? archiveByYear[leadYear] : [];

  return (
    <div className="bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_36%,var(--color-bone)_100%)]">
      <section className="px-6 pb-14 pt-24 md:px-12 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1440px] gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(360px,1.12fr)] xl:gap-10">
          <Reveal className="flex flex-col justify-between gap-10">
            <div>
              <SectionLabel>Archive</SectionLabel>
              <h1 className="mt-0 max-w-[10ch] font-display text-[clamp(40px,11vw,104px)] leading-[0.9] tracking-[-0.06em] text-[var(--color-near-black)] md:max-w-[11ch] md:leading-[0.86]">
                The longer memory of the gallery.
              </h1>
              <p className="mt-5 max-w-[56ch] text-[15px] leading-7 text-[var(--color-warm-slate)] md:mt-6 md:leading-8">
                Revisit past exhibitions by year and move back through the recent history of Studio 201.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-8">
                <PublicActionLink href="/exhibitions">Current program</PublicActionLink>
                <PublicActionLink href="/artists" tone="light">
                  Meet the artists
                </PublicActionLink>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--color-rule)] pt-5 sm:flex sm:flex-wrap sm:gap-x-8 sm:pt-6 md:mt-8">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Shows</div>
                  <div className="mt-2 text-sm text-[var(--color-near-black)]">{archiveExhibitions.length} in the archive</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Years</div>
                  <div className="mt-2 text-sm text-[var(--color-near-black)]">{years.length} represented</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <PublicSurface>
              <div className="p-8 md:p-10">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                  Latest archive year
                </div>
                <h2 className="mt-4 font-display text-[clamp(40px,5vw,64px)] leading-[0.9] tracking-[-0.05em] text-[var(--color-near-black)]">
                  {leadYear || "Archive"}
                </h2>
                <p className="mt-5 max-w-[42ch] text-sm leading-7 text-[var(--color-warm-slate)]">
                  Start with the most recent archive year, then move backwards through the exhibition history.
                </p>

                <div className="mt-8 space-y-4">
                  {leadYearItems.slice(0, 3).map((exhibition) => (
                    <Link
                      key={exhibition.id}
                      href={`/exhibitions/${exhibition.slug}`}
                      className="grid gap-4 border-t border-[var(--color-rule)] pt-4 first:border-t-0 first:pt-0 md:grid-cols-[84px_minmax(0,1fr)]"
                    >
                      <div className="font-display text-[32px] leading-none tracking-[-0.05em] text-[var(--color-sienna)]">
                        {formatYear(exhibition)}
                      </div>
                      <div>
                        <div className="font-display text-[28px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
                          {exhibition.title}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-warm-slate)]">
                          {formatDateRange(exhibition.startDate, exhibition.endDate)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </PublicSurface>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[rgba(250,248,244,0.74)] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <Reveal>
            <SectionLabel>Timeline</SectionLabel>
          </Reveal>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <Reveal>
              <div className="max-w-[460px]">
                <h2 className="font-display text-[clamp(32px,4vw,48px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-near-black)]">
                  Browse the archive by year.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--color-warm-slate)]">
                  Open any exhibition record for dates, artists, and published works.
                </p>
              </div>
            </Reveal>

            {archiveExhibitions.length === 0 ? (
              <PublicEmptyState
                title="No archive exhibitions yet"
                description="Archive entries will appear here once past exhibitions are connected to the public record."
              />
            ) : (
              <div className="space-y-8">
                {years.map((year, yearIndex) => (
                  <Reveal key={year} delay={((yearIndex % 3) + 1) as 1 | 2 | 3}>
                    <PublicSurface className="overflow-hidden">
                      <div className="grid gap-0 lg:grid-cols-[140px_minmax(0,1fr)]">
                        <div className="border-b border-[var(--color-rule)] bg-[var(--color-bone)] px-5 py-5 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
                          <div className="font-display text-[42px] leading-none tracking-[-0.05em] text-[var(--color-sienna)]">
                            {year}
                          </div>
                        </div>

                        <div className="divide-y divide-[var(--color-rule)]">
                          {archiveByYear[year].map((exhibition) => (
                            <Link
                              key={exhibition.id}
                              href={`/exhibitions/${exhibition.slug}`}
                              className="grid gap-4 px-5 py-5 transition-colors duration-200 hover:bg-[var(--color-bone)]/40 md:grid-cols-[120px_minmax(0,1fr)_96px] md:items-center md:gap-5 md:px-6 md:py-6"
                            >
                              <div className="aspect-[4/3] overflow-hidden rounded-[16px] bg-[var(--color-bone)] md:rounded-[18px]">
                                <ExhibitionCoverFrame
                                  image={exhibition.coverImageUrl}
                                  alt={exhibition.title}
                                  className="h-full w-full"
                                  paddingClassName="p-2"
                                  imageClassName="h-full w-full"
                                  placeholderLabel="Archive"
                                />
                              </div>

                              <div>
                                <div className="font-display text-[26px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)] md:text-[30px]">
                                  {exhibition.title}
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--color-warm-slate)]">
                                  {formatDateRange(exhibition.startDate, exhibition.endDate)}
                                </p>
                              </div>

                              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-right">
                                View show
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </PublicSurface>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
