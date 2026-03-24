import { notFound } from "next/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PublicActionLink, PublicSurface } from "@/components/ui/PublicPagePrimitives";
import { ImageGrid } from "@/features/events/components/ImageGrid";
import type { EventDto } from "@/features/events/services/eventService";
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

const getEventImages = () => {
  return [] as {
    id: string;
    url: string;
    alt?: string;
    type?: "image" | "video";
    thumbnailUrl?: string;
  }[];
};

export default async function EventDocumentationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  const images = getEventImages();

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-28">
      <div className="border-b border-[var(--color-rule)] px-6 py-5 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PublicActionLink href={`/events/${slug}`} tone="ghost">
            Back to event
          </PublicActionLink>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            Event documentation
          </div>
        </div>
      </div>

      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[1240px] space-y-12">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
              <div>
                <SectionLabel>Documentation</SectionLabel>
                <h1 className="mt-6 max-w-[12ch] font-display text-[clamp(42px,6vw,82px)] leading-[0.92] tracking-[-0.05em] text-[var(--color-near-black)]">
                  {event.title}
                </h1>
                {event.subtitle ? (
                  <p className="mt-5 max-w-[42ch] font-sub text-[clamp(20px,2.6vw,28px)] italic font-light leading-[1.5] text-[var(--color-warm-slate)]">
                    {event.subtitle}
                  </p>
                ) : null}
              </div>

              <PublicSurface tone="muted">
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    Notes
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-warm-slate)]">
                    Photographs and video from the event will appear here once they are published.
                  </p>
                </div>
              </PublicSurface>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <PublicSurface className="p-6 md:p-8">
              <ImageGrid images={images} />
            </PublicSurface>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
