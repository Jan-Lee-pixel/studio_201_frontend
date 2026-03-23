import { ExhibitionsCarousel } from "@/features/exhibitions/components/ExhibitionCarousel";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { getPublicCollection } from "@/lib/publicApi";

// For realistic date formatting
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Upcoming";
  const date = new Date(dateStr);
  return date > new Date() ? `Opening ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "Now on View";
}

export default async function ExhibitionsPage() {
  const exhibitions = await getPublicCollection<Exhibition>("/Exhibitions", {
    revalidate: 60,
    tags: ["public-exhibitions"],
  });

  if (exhibitions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-charcoal)] flex items-center justify-center px-6 md:px-12">
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-sienna)] mb-4">
            Studio 201
          </div>
          <h1 className="font-display text-[clamp(36px,6vw,64px)] text-[var(--color-cream)]">
            No exhibitions yet
          </h1>
          <p className="font-sub italic text-[var(--color-dust)] mt-3">
            Check back soon for upcoming shows.
          </p>
        </div>
      </div>
    );
  }

  const carouselData = exhibitions.map(ex => ({
    slug: ex.slug,
    title: ex.title,
    artist: "Group Exhibition", // Placeholder unless backend provides artist association for solo shows
    date: formatDate(ex.startDate),
    image: ex.coverImageUrl || null
  }));

  return <ExhibitionsCarousel exhibitions={carouselData} />;
}
