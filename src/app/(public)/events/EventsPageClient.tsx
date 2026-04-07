"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Reveal } from "@/components/animation/Reveal";
import {
  PublicCatalogHeader,
  PublicEmptyState,
} from "@/components/ui/PublicPagePrimitives";
import { EventRow } from "@/features/events/components/EventRow";
import type { EventDto } from "@/features/events/services/eventService";
import {
  formatEventDate,
  formatEventDateRange,
  formatEventDay,
  formatEventMonthLabel,
  getEventEffectiveDate,
} from "@/features/events/utils/publicEventPresentation";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";

type FilterType = "all" | "studio" | "external" | "archive";

type EventRowData = {
  slug?: string;
  hrefPrefix?: string;
  hasDocumentation?: boolean;
  date: string;
  day: string;
  type: string;
  title: string;
  subtitle: string;
  venue: string;
  time: string;
  isExternal?: boolean;
  isPast?: boolean;
  monthLabel?: string;
  sortDate?: Date | null;
};

const filters: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "studio", label: "Studio" },
  { id: "external", label: "External" },
  { id: "archive", label: "Archive" },
];

export default function EventsPage({
  initialEvents,
  initialOpenExhibitions,
  initialArchiveExhibitions,
}: {
  initialEvents: EventDto[];
  initialOpenExhibitions: Exhibition[];
  initialArchiveExhibitions: Exhibition[];
}) {
  const [filter, setFilter] = useState<FilterType>("all");
  const events = initialEvents;
  const openExhibitions = initialOpenExhibitions;
  const archiveExhibitions = initialArchiveExhibitions;

  const allItems = useMemo(() => {
    const now = new Date();

    const normalizedEvents: EventRowData[] = events.map((event) => {
      const effectiveDate = getEventEffectiveDate(event.startDate, event.endDate);
      return {
        slug: event.slug,
        hasDocumentation: event.hasDocumentation,
        date: formatEventDate(event.startDate),
        day: formatEventDay(event.startDate),
        type: event.type || "Event",
        title: event.title,
        subtitle: event.subtitle || "",
        venue: event.venue || "Studio 201",
        time: event.timeLabel || "",
        isExternal: event.isExternal,
        isPast: effectiveDate ? effectiveDate < now : false,
        monthLabel: formatEventMonthLabel(event.startDate),
        sortDate: effectiveDate,
      };
    });

    const normalizedOpenExhibitions: EventRowData[] = openExhibitions.map((exhibition) => {
      const effectiveDate = getEventEffectiveDate(exhibition.startDate, exhibition.endDate);
      return {
        slug: exhibition.slug,
        hrefPrefix: "/exhibitions",
        date: formatEventDate(exhibition.startDate),
        day: formatEventDay(exhibition.startDate),
        type: "Exhibition",
        title: exhibition.title,
        subtitle: exhibition.description || "Studio 201 exhibition",
        venue: "Studio 201",
        time: formatEventDateRange(exhibition.startDate, exhibition.endDate),
        isExternal: false,
        isPast: effectiveDate ? effectiveDate < now : false,
        monthLabel: formatEventMonthLabel(exhibition.startDate),
        sortDate: effectiveDate,
      };
    });

    const normalizedArchiveExhibitions: EventRowData[] = archiveExhibitions.map((exhibition) => ({
      slug: exhibition.slug,
      hrefPrefix: "/exhibitions",
      date: formatEventDate(exhibition.startDate),
      day: formatEventDay(exhibition.startDate),
      type: "Exhibition",
      title: exhibition.title,
      subtitle: exhibition.description || "Studio 201 exhibition",
      venue: "Studio 201",
      time: formatEventDateRange(exhibition.startDate, exhibition.endDate),
      isExternal: false,
      isPast: true,
      monthLabel: formatEventMonthLabel(exhibition.startDate || exhibition.endDate),
      sortDate: getEventEffectiveDate(exhibition.startDate, exhibition.endDate),
    }));

    return [...normalizedEvents, ...normalizedOpenExhibitions, ...normalizedArchiveExhibitions];
  }, [archiveExhibitions, events, openExhibitions]);

  const groupedEvents = useMemo(() => {
    const filteredItems = allItems.filter((item) => {
      if (filter === "all") return true;
      if (filter === "studio") return !item.isExternal && !item.isPast;
      if (filter === "external") return !!item.isExternal && !item.isPast;
      if (filter === "archive") return !!item.isPast;
      return true;
    });

    const sortedItems = [...filteredItems].sort((a, b) => {
      const aTime = a.sortDate ? a.sortDate.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.sortDate ? b.sortDate.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

    const grouped = sortedItems.reduce<Record<string, EventRowData[]>>((acc, item) => {
      const monthKey = item.monthLabel || "TBA";
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(item);
      return acc;
    }, {});

    return Object.entries(grouped).map(([month, items]) => ({ month, items }));
  }, [allItems, filter]);

  const upcomingCount = allItems.filter((item) => !item.isPast).length;
  const externalCount = allItems.filter((item) => item.isExternal && !item.isPast).length;
  const archiveCount = allItems.filter((item) => item.isPast).length;

  return (
    <div className="bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_36%,var(--color-bone)_100%)]">
      <PublicCatalogHeader
        title="Events"
        description="Upcoming gatherings, studio events, external shows, and archive records in one place."
        meta={`${upcomingCount} scheduled · ${externalCount} off-site · ${archiveCount} archived`}
      >
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={clsx(
                "shrink-0 rounded-full border px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300 md:px-3 md:py-2 md:text-[10px]",
                filter === option.id
                  ? "border-[var(--color-near-black)] bg-[var(--color-near-black)] text-[var(--color-cream)]"
                  : "border-[var(--color-rule)] text-[var(--color-dust)] hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </PublicCatalogHeader>

      <section className="px-6 pb-16 pt-2 md:px-12 md:pb-24 md:pt-4">
        <div className="mx-auto max-w-[1440px]">
          {groupedEvents.length === 0 ? (
            <PublicEmptyState
              title="No events found"
              description="There are no public programs in this filter yet. Try another calendar view or check back once new events are published."
            />
          ) : (
            <div className="space-y-6 md:space-y-10">
              {groupedEvents.map((group, groupIndex) => (
                <Reveal key={group.month} delay={((groupIndex % 3) + 1) as 1 | 2 | 3}>
                  <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)] md:gap-8">
                    <div className="pt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:pt-2 md:text-[10px]">
                      {group.month}
                    </div>
                    <div className="overflow-hidden rounded-[24px] border border-[var(--color-rule)] bg-[rgba(255,255,255,0.82)] px-4 shadow-[0_16px_38px_rgba(33,28,24,0.04)] md:rounded-[26px] md:px-8">
                      {group.items.map((event, index) => (
                        <EventRow
                          key={`${group.month}-${event.slug || event.title}-${index}`}
                          {...event}
                          delay={0}
                        />
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
