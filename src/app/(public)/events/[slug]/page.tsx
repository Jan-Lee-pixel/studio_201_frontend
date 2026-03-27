import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PublicActionLink, PublicSurface } from "@/components/ui/PublicPagePrimitives";
import type { EventDto } from "@/features/events/services/eventService";
import { formatEventDateRange } from "@/features/events/utils/publicEventPresentation";
import { getPublicFetchConfig, PUBLIC_API_BASE_URL } from "@/lib/publicApi";

async function getEvent(slug: string): Promise<EventDto | null> {
  try {
    const res = await fetch(
      `${PUBLIC_API_BASE_URL}/Events/slug/${slug}`,
      getPublicFetchConfig({ revalidate: 300, tags: [`event-${slug}`, "public-events"] }),
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: "Event | Studio 201" };
  }

  return {
    title: `${event.title} | Studio 201`,
    description: event.subtitle || event.description || `Event details for ${event.title} at Studio 201.`,
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  const typeLabel = event.type || "Event";
  const eventDate = formatEventDateRange(event.startDate, event.endDate);

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-28">
      <div className="border-b border-[var(--color-rule)] px-6 py-5 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PublicActionLink href="/events" tone="ghost">
            Back to events
          </PublicActionLink>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            {event.isExternal ? "External program" : "Studio 201 program"}
          </div>
        </div>
      </div>

      <section className="px-6 py-14 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-[1220px] gap-8 lg:grid-cols-[minmax(320px,460px)_minmax(0,1fr)] lg:gap-12">
          <Reveal className="order-1">
            <PublicSurface className="overflow-hidden">
              {event.coverImageUrl ? (
                <img src={event.coverImageUrl} alt={event.title} className="h-full min-h-[260px] w-full object-cover md:min-h-[360px]" />
              ) : (
                <div className="min-h-[260px] bg-[radial-gradient(circle_at_25%_18%,rgba(243,217,186,0.58),transparent_28%),linear-gradient(180deg,#8c6953_0%,#3f3836_100%)] md:min-h-[360px]" />
              )}
            </PublicSurface>
          </Reveal>

          <Reveal delay={1} className="order-2">
            <div className="space-y-8 md:space-y-10">
              <div>
                <SectionLabel>Event Details</SectionLabel>
                <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                  <span>{typeLabel}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--color-rule)]" />
                  <span>{event.isExternal ? "External" : "Studio 201"}</span>
                </div>
              </div>

              <div>
                <h1 className="font-display text-[clamp(44px,7vw,92px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-near-black)]">
                  {event.title}
                </h1>
                {event.subtitle ? (
                  <p className="mt-5 max-w-[44ch] font-sub text-[clamp(22px,3vw,30px)] italic font-light leading-[1.5] text-[var(--color-warm-slate)]">
                    {event.subtitle}
                  </p>
                ) : null}
              </div>

              <div className="border-y border-[var(--color-rule)]">
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="border-b border-[var(--color-rule)] px-0 py-5 md:border-r">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Dates</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">{eventDate}</div>
                  </div>
                  <div className="border-b border-[var(--color-rule)] px-0 py-5 md:pl-8">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Venue</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">{event.venue || "Studio 201"}</div>
                  </div>
                  <div className="border-b border-[var(--color-rule)] px-0 py-5 md:border-b-0 md:border-r">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Time</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">{event.timeLabel || "Schedule announced with the program"}</div>
                  </div>
                  <div className="px-0 py-5 md:pl-8">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Documentation</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">
                      {event.hasDocumentation ? "Available" : "Not published yet"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-[720px] whitespace-pre-line text-sm leading-8 text-[var(--color-warm-slate)]">
                {event.description || "Event details will appear here once they are published."}
              </div>

              <PublicSurface tone="muted">
                <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_220px] md:items-center md:p-8">
                  <div>
                    <div className="font-display text-[30px] leading-[1.08] tracking-[-0.03em] text-[var(--color-near-black)]">
                      Follow this event in the wider calendar.
                    </div>
                    <p className="mt-3 max-w-[48ch] text-sm leading-7 text-[var(--color-warm-slate)]">
                      Return to the full events page or open documentation when photographs or video are available.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    {event.hasDocumentation ? (
                      <PublicActionLink href={`/events/${slug}/documentation`} tone="dark">
                        View documentation
                      </PublicActionLink>
                    ) : null}
                    <PublicActionLink href="/events" tone="ghost">
                      Return to calendar
                    </PublicActionLink>
                  </div>
                </div>
              </PublicSurface>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
