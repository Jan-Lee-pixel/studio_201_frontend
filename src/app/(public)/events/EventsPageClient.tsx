"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EventRow } from "@/features/events/components/EventRow";
import { eventService, EventDto } from "@/features/events/services/eventService";
import { Skeleton } from "@/components/ui/Skeleton";

type FilterType = "all" | "studio" | "external" | "archive";

type EventRowData = {
  slug?: string;
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
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDay = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
};

const getMonthLabel = (dateStr?: string) => {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export default function EventsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "studio", label: "Studio Events" },
    { id: "external", label: "External Shows" },
    { id: "archive", label: "Archive" },
  ];

  useEffect(() => {
    eventService
      .getEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groupedEvents = useMemo(() => {
    if (events.length === 0) return [] as { month: string; items: EventRowData[] }[];

    const now = new Date();
    const normalized: EventRowData[] = events.map((event) => {
      const start = event.startDate ? new Date(event.startDate) : null;
      const end = event.endDate ? new Date(event.endDate) : null;
      const effectiveDate = end || start;
      const isPast = effectiveDate ? effectiveDate < now : false;
      const monthLabel = getMonthLabel(event.startDate);

      return {
        slug: event.slug,
        hasDocumentation: event.hasDocumentation,
        date: formatDate(event.startDate),
        day: formatDay(event.startDate),
        type: event.type || "Event",
        title: event.title,
        subtitle: event.subtitle || "",
        venue: event.venue || "Studio 201",
        time: event.timeLabel || "",
        isExternal: event.isExternal,
        isPast,
        monthLabel,
      };
    });

    const filteredItems = normalized.filter((item) => {
      if (filter === "all") return true;
      if (filter === "studio") return !item.isExternal && !item.isPast;
      if (filter === "external") return !!item.isExternal && !item.isPast;
      if (filter === "archive") return !!item.isPast;
      return true;
    });

    const grouped = filteredItems.reduce<Record<string, EventRowData[]>>((acc, item) => {
      const monthKey = item.monthLabel || "TBA";
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(item);
      return acc;
    }, {});

    return Object.entries(grouped).map(([month, items]) => ({
      month,
      items,
    }));
  }, [events, filter]);

  return (
    <div className="pt-32 min-h-screen bg-[var(--color-parchment)]">
      <div className="px-6 md:px-12 pb-16 border-b border-[var(--color-rule)]">
        <Reveal>
          <SectionLabel>Cultural Calendar</SectionLabel>
        </Reveal>
        <Reveal>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal leading-[1.1] mb-10 tracking-[-0.02em]">
            Events &<br />
            Programming
          </h1>
        </Reveal>

        <Reveal className="flex gap-8 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "relative font-body text-[13px] bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 whitespace-nowrap after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1px] after:bg-[var(--color-sienna)] after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]",
                filter === f.id
                  ? "text-[var(--color-near-black)] after:scale-x-100"
                  : "text-[var(--color-warm-slate)] after:scale-x-0 hover:text-[var(--color-near-black)]",
              )}
            >
              {f.label}
            </button>
          ))}
        </Reveal>
      </div>

      <div className="px-6 md:px-12">
        {loading ? (
          <div className="py-12 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : groupedEvents.length === 0 ? (
          <div className="py-20 text-center text-gray-500 font-dm-mono text-sm tracking-widest uppercase">
            No Events Found
          </div>
        ) : (
          groupedEvents.map((group, groupIndex) => (
            <div
              key={group.month}
              className={clsx(
                "py-16",
                groupIndex === groupedEvents.length - 1 && "pb-20",
              )}
            >
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-0 pb-6 border-b border-[var(--color-rule)]">
                {group.month}
              </div>
              {group.items.map((event, i) => (
                <EventRow
                  key={`${group.month}-${i}`}
                  {...event}
                  delay={((i % 5) + 1) as 0 | 1 | 2 | 3 | 4 | 5}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
