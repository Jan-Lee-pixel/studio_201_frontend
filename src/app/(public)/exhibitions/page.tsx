'use client';

import { ExhibitionsCarousel } from "@/features/exhibitions/components/ExhibitionCarousel";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { useEffect, useState } from "react";

// For realistic date formatting
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "Upcoming";
  const date = new Date(dateStr);
  return date > new Date() ? `Opening ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "Now on View";
}

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exhibitionService.getExhibitions()
      .then(setExhibitions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--color-charcoal)] font-dm-mono text-gray-500 uppercase tracking-widest text-sm">
        Loading Exhibitions...
      </div>
    );
  }

  // Fallback to static if no dynamic data
  const carouselData = exhibitions.length > 0 ? exhibitions.map(ex => ({
    slug: ex.slug,
    title: ex.title,
    artist: "Group Exhibition", // Placeholder unless backend provides artist association for solo shows
    date: formatDate(ex.startDate),
    image: ex.coverImageUrl || "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=1800&q=80"
  })) : [
    {
      slug: "mga-paa-sa-alapaap",
      image: "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1800&q=80",
      title: "Mga Paa sa Alapaap",
      artist: "Maria Santos",
      date: "Now on View",
    },
    {
      slug: "lupa-at-langit",
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
      title: "Lupa at Langit",
      artist: "Jun Manlangit",
      date: "Opening Nov 30, 2025",
    }
  ];

  return <ExhibitionsCarousel exhibitions={carouselData} />;
}
