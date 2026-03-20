import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { ImageGrid } from "@/features/events/components/ImageGrid";

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

  // Extract a readable title from the slug (mock behavior)
  const readableTitle = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const images = getEventImages();

  return (
    <div className="pt-32 pb-32 min-h-[80vh] bg-[var(--color-parchment)]">
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
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-3">
              Event Documentation
            </div>
            <h1 className="font-display text-[clamp(32px,5vw,56px)] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--color-near-black)]">
              {readableTitle}
            </h1>
          </div>
        </Reveal>

        <Reveal delay={2}>
          <ImageGrid images={images} />
        </Reveal>
      </div>
    </div>
  );
}
