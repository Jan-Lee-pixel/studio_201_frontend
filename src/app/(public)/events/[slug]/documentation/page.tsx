import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { ImageGrid } from "@/features/events/components/ImageGrid";

// Mock data generator for images based on slug
const getEventImages = (slug: string) => {
  // Common placeholders for the demo
  const mockImages: { id: string; url: string; alt?: string; type?: "image" | "video"; thumbnailUrl?: string }[] = [
    { id: "1", type: "image", url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&q=80", alt: "Opening remarks" },
    { id: "2", type: "image", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80", alt: "Art viewing" },
    { id: "3", type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnailUrl: "https://peach.blender.org/wp-content/uploads/bbb-splash.png", alt: "Big Buck Bunny Sample Video" },
    { id: "4", type: "image", url: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80", alt: "Artist interview" },
    { id: "5", type: "image", url: "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1200&q=80", alt: "Gallery wide shot" },
    { id: "6", type: "image", url: "https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=1200&q=80", alt: "Close up of artwork" },
    { id: "7", type: "image", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80", alt: "Studio exterior" },
    { id: "8", type: "image", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80", alt: "Guest taking photos" },
  ];

  return mockImages;
};

export default async function EventDocumentationPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  // Extract a readable title from the slug (mock behavior)
  const readableTitle = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const images = getEventImages(slug);

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
