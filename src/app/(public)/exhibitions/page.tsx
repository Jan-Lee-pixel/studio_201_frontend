import { Metadata } from "next";
import { ExhibitionsCarousel } from "@/features/exhibitions/components/ExhibitionCarousel";

export const metadata: Metadata = {
  title: "Exhibitions - Studio 201",
  description: "Featured exhibitions at Studio 201",
};

export default function ExhibitionsPage() {
  const exhibitions = [
    {
      slug: "mga-paa-sa-alapaap",
      image:
        "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1800&q=80",
      title: "Mga Paa sa Alapaap",
      artist: "Maria Santos",
      date: "Now on View",
    },
    {
      slug: "lupa-at-langit",
      image:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
      title: "Lupa at Langit",
      artist: "Jun Manlangit",
      date: "Opening Nov 30, 2025",
    },
    {
      slug: "ulan-sa-disyembre",
      image:
        "https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=800&q=80",
      title: "Ulan sa Disyembre",
      artist: "Elena Yap",
      date: "Opening Jan 15, 2026",
    },
    {
      slug: "dagat-ng-alaala",
      image:
        "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80",
      title: "Dagat ng Alaala",
      artist: "Carlo Reyes",
      date: "Opening Mar 5, 2026",
    },
  ];

  return <ExhibitionsCarousel exhibitions={exhibitions} />;
}
