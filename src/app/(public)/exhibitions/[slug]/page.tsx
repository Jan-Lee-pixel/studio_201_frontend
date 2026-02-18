import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/animation/Reveal";
import { ArtworkCard } from "@/features/artworks/components/ArtworkCard";

export default function ExhibitionResultPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1800&q=80"
          alt="Mga Paa sa Alapaap"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,22,15,0.85)] to-transparent via-transparent via-60%"></div>
        <div className="absolute bottom-20 left-6 right-6 md:left-12 md:right-12 border-t border-[rgba(240,237,229,0.2)] pt-8">
          <div className="flex justify-between items-end mb-4">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-sienna)]">Exhibition</div>
            <div className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.06em]">Oct 3 – Nov 28, 2025</div>
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] font-normal tracking-[-0.02em] leading-[1.05] text-[var(--color-cream)] mb-3">
            Mga Paa sa Alapaap
          </h1>
          <div className="font-sub italic text-xl text-[var(--color-dust)]">Maria Santos</div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* INTRO */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_480px] gap-12 md:gap-30 py-24 border-b border-[var(--color-rule)]">
          <Reveal className="text-[var(--color-warm-slate)]">
            <h3 className="font-sub italic text-[26px] font-light mb-8 leading-[1.4]">
              "To paint is to remember. To remember is to survive."
            </h3>
            <p className="text-base leading-[1.75] mb-5">
              Mga Paa sa Alapaap is a collection of large-format paintings rooted in Santos's experience of displacement, childhood memory, and the landscape of Southern Philippines. The works navigate between the personal and the mythic — feet that never quite touch ground, skies that hold the weight of everything unsaid.
            </p>
            <p className="text-base leading-[1.75] mb-5">
              Santos works predominantly in oil with occasional mixed-media interventions — fragments of abaca fiber, scorched cloth, and earth gathered from specific sites in Cebu and Leyte. Each work is both document and dream.
            </p>
            <div className="mt-12">
              <Link href="/artists/maria-santos" className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-near-black)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100">View artist profile →</Link>
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">Artist</div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">Maria Santos</div>
            
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">Medium</div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">Oil, Mixed Media</div>
            
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">Duration</div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">Oct 3 – Nov 28, 2025</div>
            
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--color-dust)] mb-4">Location</div>
            <div className="font-body text-[15px] text-[var(--color-near-black)] mb-8">Studio 201 Main Gallery<br />Cebu, Philippines</div>
            
            <div className="mt-10">
              <Button>Inquire about works</Button>
            </div>
          </Reveal>
        </div>

        {/* PULL QUOTE */}
        <Reveal className="font-sub italic text-[clamp(22px,3vw,32px)] font-light text-[var(--color-warm-slate)] leading-[1.4] py-16 border-y border-[var(--color-rule)] my-12 max-w-[720px] ml-auto">
          The body always knows where home is, even when the mind has learned to forget.
        </Reveal>

        {/* ARTWORKS */}
        <div className="py-20">
          <Reveal><h2 className="font-display text-[28px] font-normal mb-12 tracking-[-0.01em]">Works in Exhibition</h2></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            <ArtworkCard
              image="https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80"
              title="Ang Paa na Hindi Lumupad, I"
              meta="2025 · Oil on canvas · 180 × 240 cm"
              delay={1}
            />
            <ArtworkCard
              image="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"
              title="Ang Paa na Hindi Lumupad, II"
              meta="2025 · Oil, abaca fiber · 120 × 180 cm"
              delay={2}
            />
            <ArtworkCard
              image="https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80"
              title="Dagat na Walang Hangganan"
              meta="2024 · Oil, earth, cloth · 200 × 300 cm"
              delay={3}
            />
            <ArtworkCard
              image="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80"
              title="Langit ng Aking Ina"
              meta="2025 · Oil on linen · 150 × 200 cm"
              delay={4}
            />
          </div>
        </div>

        {/* RELATED ARTISTS */}
        <Reveal className="py-20 border-t border-[var(--color-rule)]">
          <SectionLabel>Artists in this Exhibition</SectionLabel>
          <div className="mt-8">
            <div className="font-display text-[22px] font-normal mb-1.5">Maria Santos</div>
            <div className="font-mono text-[10px] text-[var(--color-dust)] tracking-[0.08em] mb-4">CEBU, PHILIPPINES</div>
            <Link href="/artists/maria-santos" className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-near-black)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100">View full profile →</Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
