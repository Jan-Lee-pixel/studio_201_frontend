import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import { ExhibitionCoverFrame } from "@/features/exhibitions/components/ExhibitionCoverFrame";
import { PublicCatalogHeader } from "@/components/ui/PublicPagePrimitives";
import { WorkspaceStatusPill } from "@/components/ui/WorkspacePrimitives";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { getPublicCollection } from "@/lib/publicApi";

type ExhibitionState = {
  label: string;
  tone: "neutral" | "accent" | "success" | "warning";
  order: number;
};

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDateRange(startDate?: string, endDate?: string) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start && !end) return "Dates to be announced";

  const startLabel = start
    ? start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Opening date TBA";

  if (!end || start?.getTime() === end.getTime()) {
    return startLabel;
  }

  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} - ${endLabel}`;
}

function getExhibitionState(exhibition: Exhibition): ExhibitionState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(exhibition.startDate);
  const end = parseDate(exhibition.endDate);

  if (start && start > today) {
    return { label: "Upcoming", tone: "accent", order: 1 };
  }

  if (end && end < today) {
    return { label: "Archive", tone: "neutral", order: 3 };
  }

  if (start || end) {
    return { label: "On View", tone: "success", order: 0 };
  }

  return { label: "Program", tone: "warning", order: 2 };
}

function sortExhibitions(exhibitions: Exhibition[]) {
  return [...exhibitions].sort((left, right) => {
    const leftState = getExhibitionState(left);
    const rightState = getExhibitionState(right);

    if (leftState.order !== rightState.order) {
      return leftState.order - rightState.order;
    }

    const leftValue = parseDate(left.startDate)?.getTime() ?? parseDate(left.endDate)?.getTime() ?? 0;
    const rightValue = parseDate(right.startDate)?.getTime() ?? parseDate(right.endDate)?.getTime() ?? 0;

    if (leftState.label === "Archive" && rightState.label === "Archive") {
      return rightValue - leftValue;
    }

    return leftValue - rightValue;
  });
}

function excerpt(value?: string, fallback?: string) {
  const text = value?.trim() || fallback || "";
  return text.length > 150 ? `${text.slice(0, 150)}...` : text;
}

function ProgramCard({
  exhibition,
  note,
}: {
  exhibition: Exhibition;
  note: string;
}) {
  const state = getExhibitionState(exhibition);

  return (
    <Reveal>
      <Link
        href={`/exhibitions/${exhibition.slug}`}
        className="group overflow-hidden rounded-[26px] border border-[var(--color-rule)] bg-white/90 shadow-[0_16px_38px_rgba(33,28,24,0.04)] transition-transform duration-200 hover:-translate-y-1"
      >
        <div className="aspect-[4/3] overflow-hidden bg-[var(--color-bone)]">
          <ExhibitionCoverFrame
            image={exhibition.coverImageUrl}
            alt={exhibition.title}
            className="h-full w-full"
            paddingClassName="p-4"
            imageClassName="h-full w-full"
          />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <WorkspaceStatusPill tone={state.tone}>{state.label}</WorkspaceStatusPill>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              {formatDateRange(exhibition.startDate, exhibition.endDate)}
            </span>
          </div>
          <h2 className="mt-5 font-display text-[30px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
            {exhibition.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-warm-slate)]">
            {excerpt(
              exhibition.description,
              "Dates, artists, and published works are available on the exhibition page.",
            )}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--color-rule)] pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">{note}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)] transition-transform duration-200 group-hover:translate-x-1">
              Open exhibition
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function ExhibitionsPage() {
  const [programExhibitions, archiveExhibitions] = await Promise.all([
    getPublicCollection<Exhibition>("/Exhibitions", {
      revalidate: 60,
      tags: ["public-exhibitions"],
    }),
    getPublicCollection<Exhibition>("/Exhibitions/archive", {
      revalidate: 300,
      tags: ["public-archive"],
    }),
  ]);

  const orderedProgram = sortExhibitions(programExhibitions);
  const archivePreview = archiveExhibitions.slice(0, 3);
  const onViewCount = orderedProgram.filter((exhibition) => getExhibitionState(exhibition).label === "On View").length;
  const upcomingCount = orderedProgram.filter((exhibition) => getExhibitionState(exhibition).label === "Upcoming").length;

  if (orderedProgram.length === 0 && archivePreview.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-parchment)] px-6 md:px-12">
        <div className="text-center">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-sienna)]">
            Studio 201
          </div>
          <h1 className="font-display text-[clamp(36px,6vw,64px)] text-[var(--color-near-black)]">
            No exhibitions yet
          </h1>
          <p className="mt-3 font-sub italic text-[var(--color-warm-slate)]">
            Check back soon for upcoming shows.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_36%,var(--color-bone)_100%)]">
      <PublicCatalogHeader
        title="Exhibitions"
        description="Current, upcoming, and recent program records from Studio 201."
        meta={`${onViewCount} on view · ${upcomingCount} upcoming · ${archiveExhibitions.length} archived`}
      />

      <section id="program" className="px-6 pb-16 pt-2 md:px-12 md:pb-24 md:pt-4">
        <div className="mx-auto max-w-[1440px]">
          {orderedProgram.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {orderedProgram.map((exhibition, index) => (
                <ProgramCard
                  key={exhibition.id}
                  exhibition={exhibition}
                  note={index === 0 ? "Current listing" : "Program listing"}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[26px] border border-dashed border-[var(--color-rule)] bg-[rgba(255,255,255,0.72)] px-6 py-12 text-center">
              <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                No current program
              </div>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-warm-slate)]">
                There are no active or upcoming exhibitions right now, but the archive is still available below.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <Reveal>
                <SectionLabel>Archive Preview</SectionLabel>
              </Reveal>
              <Reveal>
                <p className="mt-5 max-w-[48ch] text-sm leading-7 text-[var(--color-warm-slate)]">
                  Past exhibitions remain part of the gallery record and can still be revisited here.
                </p>
              </Reveal>
            </div>

            <Reveal>
              <Link
                href="/archive"
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full border border-[var(--color-near-black)] px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)] sm:w-auto"
              >
                Full Archive
              </Link>
            </Reveal>
          </div>

          {archivePreview.length === 0 ? (
            <div className="mt-10 rounded-[26px] border border-dashed border-[var(--color-rule)] bg-[rgba(255,255,255,0.72)] px-6 py-12 text-center">
              <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                Archive entries coming soon
              </div>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-warm-slate)]">
                Past exhibition records will appear here as they are connected to the public archive.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {archivePreview.map((exhibition) => {
                const year = exhibition.endDate
                  ? new Date(exhibition.endDate).getFullYear()
                  : exhibition.startDate
                    ? new Date(exhibition.startDate).getFullYear()
                    : null;

                return (
                  <Reveal key={exhibition.id}>
                    <Link
                      href={`/exhibitions/${exhibition.slug}`}
                      className="group overflow-hidden rounded-[24px] border border-[var(--color-rule)] bg-white/85 shadow-[0_16px_38px_rgba(33,28,24,0.04)] transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-[var(--color-bone)]">
                        <ExhibitionCoverFrame
                          image={exhibition.coverImageUrl}
                          alt={exhibition.title}
                          className="h-full w-full"
                          paddingClassName="p-4"
                          imageClassName="h-full w-full"
                          placeholderLabel="Archive"
                        />
                      </div>
                      <div className="p-5">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                          {year || "Archive"}
                        </div>
                        <div className="mt-3 font-display text-[28px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
                          {exhibition.title}
                        </div>
                        <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                          Open record
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
