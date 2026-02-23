import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

export default async function EventPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const readableTitle = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
              {readableTitle}
            </h1>
            <p className="font-body text-base mt-6 text-[var(--color-warm-slate)] max-w-2xl">
              This is a placeholder page for the individual event details. Content and booking information for "{readableTitle}" will be displayed here.
            </p>

            <div className="mt-12">
              <Link
                href={`/events/${slug}/documentation`}
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-cream)] bg-[var(--color-near-black)] px-6 py-4 hover:bg-[var(--color-sienna)] transition-colors duration-300"
              >
                View Event Photos
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
