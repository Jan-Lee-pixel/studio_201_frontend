import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { EventDto } from "@/features/events/services/eventService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5203/api";

async function getEvent(slug: string): Promise<EventDto | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/Events/slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const formatDateRange = (start?: string, end?: string) => {
  if (!start && !end) return "Date TBA";
  if (start && !end) {
    return new Date(start).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  const startStr = start ? new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  const endStr = end ? new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return `${startStr} – ${endStr}`.trim();
};

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center font-dm-mono text-gray-500 uppercase tracking-widest text-sm bg-[var(--color-charcoal)]">
        Event Not Found
      </div>
    );
  }

  return (
    <div className="pt-32 min-h-[80vh] bg-[var(--color-parchment)]">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto">
        <Reveal>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] text-[var(--color-warm-slate)] hover:text-[var(--color-sienna)] transition-colors mb-10 uppercase"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Events
          </Link>
        </Reveal>

        <Reveal delay={1}>
          <div className="mb-12 border-b border-[var(--color-rule)] pb-12">
            <SectionLabel>Event Details</SectionLabel>
            <h1 className="font-display text-[clamp(32px,5vw,56px)] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-near-black)] mt-6">
              {event.title}
            </h1>
            {event.subtitle ? (
              <p className="font-sub italic text-lg text-[var(--color-warm-slate)] mt-4">
                {event.subtitle}
              </p>
            ) : null}

            <div className="mt-6 font-mono text-[11px] tracking-[0.08em] uppercase text-[var(--color-dust)]">
              {event.type || "Event"} · {formatDateRange(event.startDate, event.endDate)}
            </div>
            <div className="mt-3 text-[var(--color-warm-slate)]">
              {event.venue || "Studio 201"}{event.timeLabel ? ` · ${event.timeLabel}` : ""}
            </div>

            <p className="font-body text-base mt-8 text-[var(--color-warm-slate)] max-w-2xl">
              {event.description || "Event details will appear here once they are published."}
            </p>

            {event.hasDocumentation && (
              <div className="mt-12">
                <Link
                  href={`/events/${slug}/documentation`}
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-cream)] bg-[var(--color-near-black)] px-6 py-4 hover:bg-[var(--color-sienna)] transition-colors duration-300"
                >
                  View Event Photos
                </Link>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
