import type { Metadata } from 'next';
import { Reveal } from '@/components/animation/Reveal';
import { EditionCard } from '@/features/editions/components/EditionCard';
import { MOCK_EDITIONS } from '@/features/editions/types';

export const metadata: Metadata = {
  title: 'Editions | Studio 201',
  description: 'Works, publications, and objects made in dialogue with artists.',
};

export default function EditionsPage() {
  const featuredEdition = MOCK_EDITIONS.find(e => e.isFeatured);
  const standardEditions = MOCK_EDITIONS.filter(e => !e.isFeatured);

  return (
    <div className="w-full">
      
      {/* HEADER SECTION */}
      <header className="px-6 md:px-12 pt-32 pb-16 border-b border-[var(--color-rule)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <Reveal>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-sienna)] mb-4">
              Studio 201
            </p>
            <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-none tracking-[-0.02em] text-[var(--color-near-black)]">
              Editions
            </h1>
          </Reveal>
          <Reveal delay={1}>
            <p className="font-body text-[13px] leading-[1.8] text-[var(--color-warm-slate)] max-w-[380px] md:border-l border-[var(--color-rule)] md:pl-8">
              Works, publications, and objects made in dialogue with artists. All editions are available exclusively in-gallery — no online purchase is available.
            </p>
          </Reveal>
        </div>
      </header>

      {/* FILTER BAR STUB */}
      <div className="px-6 md:px-12 py-5 border-b border-[var(--color-rule)] flex gap-9 items-center overflow-x-auto whitespace-nowrap">
        <button className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-near-black)] border-b border-[var(--color-near-black)] pb-1 transition-colors">
          All
        </button>
        <button className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-warm-slate)] pb-1 border-b border-transparent hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)] transition-colors">
          Publications
        </button>
        <button className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-warm-slate)] pb-1 border-b border-transparent hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)] transition-colors">
          Objects & Multiples
        </button>
        <button className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-warm-slate)] pb-1 border-b border-transparent hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)] transition-colors">
          Apparel
        </button>
        <button className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-warm-slate)] pb-1 border-b border-transparent hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)] transition-colors">
          Collaborations
        </button>
      </div>

      {/* EDITIONS GRID */}
      <main className="p-6 md:p-12 mb-20 grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-6">
        
        {/* Render Featured (spans 2 cols) */}
        {featuredEdition && (
           <EditionCard edition={featuredEdition} delay={1} />
        )}
        
        {/* Render the rest */}
        {standardEditions.map((edition, index) => (
          <EditionCard 
            key={edition.id} 
            edition={edition} 
            delay={(index % 3) + 2 as any} // Stagger animation visually
          />
        ))}

      </main>
    </div>
  );
}
