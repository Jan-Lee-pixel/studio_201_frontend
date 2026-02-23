import type { Metadata } from 'next';
import { Reveal } from '@/components/animation/Reveal';
import { SectionLabel } from '@/components/ui/SectionLabel';

export const metadata: Metadata = {
  title: 'Spaces | Studio 201',
  description: 'The gallery extends beyond the walls.',
};

export default function SpacesPage() {
  return (
    <div className="w-full">
      
      {/* HERO SECTION */}
      <section className="relative w-full h-[85vh] overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3a2818] via-[#5a4030] to-[#4a3028] animate-hero-reveal origin-center"></div>
        <div className="absolute bottom-16 left-6 md:left-12 max-w-[680px]">
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-ochre)] mb-4 opacity-0 translate-y-3 animate-slide-up [animation-delay:200ms]">
            Studio 201
          </div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[1.1] text-[var(--color-cream)] mb-4 opacity-0 translate-y-3 animate-slide-up [animation-delay:320ms]">
            The gallery<br/>
            <em className="font-sub italic text-[var(--color-ochre)]">extends</em><br/>
            beyond the walls.
          </h1>
        </div>
      </section>

      {/* COFFEE INTRODUCTION */}
      <section className="px-6 md:px-12 py-20 bg-[var(--color-parchment)]">
        <Reveal><SectionLabel>Studio 201 Coffee</SectionLabel></Reveal>
        <Reveal delay={1}>
          <h2 className="font-display text-[clamp(2rem,3.5vw,2.8rem)] font-light leading-[1.1] max-w-[600px] mb-8 mt-12 text-[var(--color-near-black)]">
            The café has always been the other room of the gallery.
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="font-body text-[14px] leading-[1.85] text-[var(--color-warm-slate)] max-w-[580px]">
            A place where the conversation continues after the last painting. Where ideas settle alongside espresso. Where the work of the gallery — its pace, its attention, its quiet — extends into the rhythm of daily life.
          </p>
        </Reveal>
      </section>

      {/* SPLIT EDITORIAL GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 bg-[var(--color-parchment)] border-t border-[var(--color-rule)]">
        <Reveal delay={1}>
          <div className="h-[50vw] md:h-full min-h-[50vh] bg-gradient-to-br from-[#5a4838] to-[#4a3828] overflow-hidden">
            {/* Image Placeholder maps to template */}
          </div>
        </Reveal>
        <div className="px-6 md:px-[64px] py-16 md:py-[80px] flex flex-col justify-center border-t md:border-t-0 md:border-l border-[var(--color-rule)]">
          <Reveal>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-warm-slate)] mb-6">This Season</p>
          </Reveal>
          <Reveal delay={1}>
            <p className="font-body text-[13px] leading-[1.85] text-[var(--color-warm-slate)] mb-6">
              This season, we're serving a natural process Ethiopian through the Hario — bright, fruit-forward, good for slow mornings. The filter menu changes monthly alongside the gallery program.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <blockquote className="font-sub text-[clamp(1.3rem,2.5vw,1.9rem)] font-light italic leading-[1.4] text-[var(--color-near-black)] border-l-2 border-[var(--color-sienna)] pl-7 my-12">
              "The café slows you down in the best possible way. You come for fifteen minutes. You stay for two hours."
              <footer className="not-italic font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-warm-slate)] block mt-4">— A Regular</footer>
            </blockquote>
          </Reveal>
          
          <Reveal delay={3}>
            <div className="flex flex-col gap-1.5 font-body text-[14px] text-[var(--color-near-black)]">
              <span><strong>Tuesday — Saturday</strong> &nbsp; 9:00 — 18:00</span>
              <span><strong>Sunday</strong> &nbsp; 10:00 — 16:00</span>
              <span className="text-[var(--color-warm-slate)]">No reservations. Come as you are.</span>
            </div>
          </Reveal>
        </div>
      </section>
      
      {/* POP-UPS & RESIDENCIES */}
      <section className="px-6 md:px-12 py-20 md:py-30 bg-[var(--color-linen)] border-t border-[var(--color-rule)]">
         <Reveal><SectionLabel>Pop-ups & Residencies</SectionLabel></Reveal>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start mt-16">
            <div>
              <Reveal delay={1}>
                <h2 className="font-display text-[clamp(2rem,3.5vw,2.8rem)] font-light leading-[1.1] mb-6 text-[var(--color-near-black)]">
                  Temporary homes for urgent ideas.
                </h2>
                <p className="font-body text-[13px] leading-[1.85] text-[var(--color-warm-slate)] mb-8">
                  Studio 201 hosts short-term residencies and pop-up programs for artists, publishers, and cultural practitioners who need a room of their own. Each residency leaves something behind — in the archive, in the walls, in the conversation.
                </p>
              </Reveal>

              {/* Current Residency Highlight */}
              <Reveal delay={2}>
                <div className="border border-[var(--color-rule)] p-8 mt-4 bg-[var(--color-parchment)]">
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-warm-slate)] mb-3">Currently in Residence</p>
                  <h3 className="font-display text-[1.3rem] font-light mb-2 text-[var(--color-near-black)]">Tao Printshop</h3>
                  <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-sienna)] mb-4">3 Feb — 28 Mar 2026</p>
                  <p className="font-body text-[12px] leading-[1.75] text-[var(--color-warm-slate)]">
                    A risograph studio operating in the gallery's back room — printing editions, hosting workshops, and making the process visible.
                  </p>
                </div>
              </Reveal>
            </div>

            <div>
              <Reveal delay={3}>
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-warm-slate)] mb-6">Past Residencies</p>
              </Reveal>
              
              <div className="flex flex-col">
                <Reveal delay={4}>
                  <div className="py-4 border-b border-[var(--color-rule)] flex justify-between items-center group cursor-none">
                    <span className="font-display text-[1.1rem] font-light transition-colors group-hover:text-[var(--color-sienna)]">Blank Canvas Studio</span>
                    <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--color-warm-slate)]">Apparel / 2025</span>
                  </div>
                </Reveal>
                <Reveal delay={5}>
                  <div className="py-4 border-b border-[var(--color-rule)] flex justify-between items-center group cursor-none">
                    <span className="font-display text-[1.1rem] font-light transition-colors group-hover:text-[var(--color-sienna)]">Kanto Reading Room</span>
                    <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--color-warm-slate)]">Library / 2024</span>
                  </div>
                </Reveal>
                <Reveal delay={5}>
                  <div className="py-4 border-b border-[var(--color-rule)] flex justify-between items-center group cursor-none">
                    <span className="font-display text-[1.1rem] font-light transition-colors group-hover:text-[var(--color-sienna)]">Materia Ceramics</span>
                    <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--color-warm-slate)]">Objects / 2024</span>
                  </div>
                </Reveal>
                <Reveal delay={5}>
                  <div className="py-4 flex justify-between items-center group cursor-none">
                    <span className="font-display text-[1.1rem] font-light transition-colors group-hover:text-[var(--color-sienna)]">Siglo Publishing</span>
                    <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--color-warm-slate)]">Publications / 2023</span>
                  </div>
                </Reveal>
              </div>
            </div>
         </div>
      </section>

    </div>
  );
}
