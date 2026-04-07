import { notFound } from "next/navigation";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PublicActionLink, PublicSurface } from "@/components/ui/PublicPagePrimitives";
import { ImageGrid } from "@/features/events/components/ImageGrid";
import type { EventDto } from "@/features/events/services/eventService";
import { getPublicEventBySlug } from "@/lib/publicData";

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
  const event = await getPublicEventBySlug(slug);

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

      <section className="px-6 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-[1240px] space-y-12">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end lg:gap-8">
              <div>
                <SectionLabel>Documentation</SectionLabel>
                <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(34px,9vw,82px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-near-black)] md:mt-6 md:leading-[0.92]">
                  {event.title}
                </h1>
                {event.subtitle ? (
                  <p className="mt-4 max-w-[42ch] font-sub text-[clamp(20px,5vw,28px)] italic font-light leading-[1.5] text-[var(--color-warm-slate)] md:mt-5">
                    {event.subtitle}
                  </p>
                ) : null}
              </div>

              <PublicSurface tone="muted">
                <div className="p-5 md:p-6">
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
            <PublicSurface className="p-5 md:p-8">
              <ImageGrid images={images} />
            </PublicSurface>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
