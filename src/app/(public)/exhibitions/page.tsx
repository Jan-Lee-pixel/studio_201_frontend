import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ExhibitionCard } from "@/features/exhibitions/components/ExhibitionCard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exhibitions - Studio 201",
  description: "Featured Exhibit in Studio 201",
};

export default function ExhibitionsPage() {
  return (
    <div className="w-full pt-32 pb-20 px-6 md:px-12">
      <Reveal>
        <SectionLabel>All Exhibitions</SectionLabel>
      </Reveal>
      <Reveal>
        <h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal leading-tight mb-16 tracking-[-0.02em]">
          Curated
          <br />
          Exhibitions
        </h1>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
        <ExhibitionCard
          slug="mga-paa-sa-alapaap"
          image="https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1800&q=80"
          title="Mga Paa sa Alapaap"
          artist="Maria Santos"
          date="Now on View"
          delay={1}
        />
        <ExhibitionCard
          slug="lupa-at-langit"
          image="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"
          title="Lupa at Langit"
          artist="Jun Manlangit"
          date="Opening Nov 30, 2025"
          delay={2}
        />
        <ExhibitionCard
          slug="ulan-sa-disyembre"
          image="https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=800&q=80"
          title="Ulan sa Disyembre"
          artist="Elena Yap"
          date="Opening Jan 15, 2026"
          delay={3}
        />
        <ExhibitionCard
          slug="dagat-ng-alaala"
          image="https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80"
          title="Dagat ng Alaala"
          artist="Carlo Reyes"
          date="Opening Mar 5, 2026"
          delay={4}
        />
      </div>
    </div>
  );
}
