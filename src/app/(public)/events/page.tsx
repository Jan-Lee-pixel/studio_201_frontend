"use client";

import { useState } from "react";
import clsx from "clsx";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { EventRow } from "@/features/events/components/EventRow";

type FilterType = "all" | "studio" | "external" | "archive";

export default function EventsPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "studio", label: "Studio Events" },
    { id: "external", label: "External Shows" },
    { id: "archive", label: "Archive" },
  ];

  const events = [
    {
      month: "November 2025",
      items: [
        { date: "Nov 5", day: "Wednesday", type: "Artist Talk", title: "Painting as Memory", subtitle: "A Conversation with Maria Santos", venue: "Studio 201", time: "7:00 PM", isExternal: false },
        { slug: "mga-paa-sa-alapaap-opening", hasDocumentation: true, date: "Nov 12", day: "Wednesday", type: "Opening Night", title: "Mga Paa sa Alapaap", subtitle: "Maria Santos", venue: "Studio 201", time: "6:00 PM", isExternal: false },
        { date: "Nov 22", day: "Saturday", type: "Workshop", title: "Oil Painting Fundamentals", subtitle: "Masterclass · Limited seats", venue: "Studio 201", time: "9:00 AM", isExternal: false },
      ]
    },
    {
      month: "December 2025",
      items: [
        { date: "Dec 2", day: "Tuesday", type: "Workshop [External]", title: "Relief Printmaking", subtitle: "with Jun Manlangit", venue: "Sugbo Mercado", time: "2:00 PM", isExternal: true },
        { date: "Dec 15", day: "Monday", type: "Symposium", title: "Contemporary Art in the Visayas", subtitle: "Panel Discussion", venue: "Studio 201", time: "10:00 AM", isExternal: false },
        { date: "Dec 30", day: "Tuesday", type: "Exhibition Closing", title: "Mga Paa sa Alapaap — Closing", subtitle: "Maria Santos", venue: "Studio 201", time: "5:00 PM", isExternal: false },
      ]
    },
    {
      month: "January 2026",
      items: [
        { slug: "visayan-contemporary", hasDocumentation: true, date: "Jan 10", day: "Saturday", type: "Group Show [External]", title: "Visayan Contemporary", subtitle: "Maria Santos — group exhibition", venue: "Ayala Museum, Manila", time: "Opening 6:00 PM", isExternal: true },
        { slug: "ulan-sa-disyembre-opening", date: "Jan 15", day: "Thursday", type: "Opening Night", title: "Ulan sa Disyembre", subtitle: "Elena Yap", venue: "Studio 201", time: "6:00 PM", isExternal: false },
      ]
    }
  ];

  // Simple filtering logic
  const filteredEvents = events.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (filter === "all") return true;
      if (filter === "studio") return !item.isExternal;
      if (filter === "external") return item.isExternal;
      return true; // No archive data in mock yet
    })
  })).filter(group => group.items.length > 0);

  return (
    <div className="pt-32 min-h-screen bg-[var(--color-parchment)]">
      <div className="px-6 md:px-12 pb-16 border-b border-[var(--color-rule)]">
        <Reveal><SectionLabel>Cultural Calendar</SectionLabel></Reveal>
        <Reveal><h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal leading-[1.1] mb-10 tracking-[-0.02em]">Events &<br />Programming</h1></Reveal>

        <Reveal className="flex gap-8 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "relative font-body text-[13px] bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 whitespace-nowrap after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[1px] after:bg-[var(--color-sienna)] after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]",
                filter === f.id
                  ? "text-[var(--color-near-black)] after:scale-x-100"
                  : "text-[var(--color-warm-slate)] after:scale-x-0 hover:text-[var(--color-near-black)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </Reveal>
      </div>

      <div className="px-6 md:px-12">
        {filteredEvents.map((group, groupIndex) => (
          <div key={group.month} className={clsx("py-16", groupIndex === filteredEvents.length - 1 && "pb-20")}>
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
        ))}
      </div>
    </div>
  );
}
