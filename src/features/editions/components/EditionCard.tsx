import Link from 'next/link';
import { clsx } from 'clsx';
import { Reveal } from '@/components/animation/Reveal';
import { PublicSurface } from '@/components/ui/PublicPagePrimitives';
import type { Edition } from '../types';

interface EditionCardProps {
  edition: Edition;
  delay?: number;
}

export function EditionCard({ edition, delay = 0 }: EditionCardProps) {
  return (
    <Reveal delay={delay as 0 | 1 | 2 | 3 | 4 | 5} className={clsx(edition.isFeatured && "md:col-span-2")}>
      <Link href={`/editions/${edition.slug}`} className="group block h-full">
        <PublicSurface className="h-full transition-transform duration-300 group-hover:-translate-y-1">
          <div
            className={clsx(
              "relative overflow-hidden",
              edition.coverImage,
              edition.isFeatured ? "aspect-[16/9]" : "aspect-[4/5]",
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(26,24,20,0.12))]" />
          </div>

          <div className="space-y-4 p-6 md:p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              {edition.category}
              {edition.isFeatured ? " · Featured edition" : ""}
            </div>
            <div>
              <h3 className="font-display text-[clamp(26px,3vw,38px)] leading-[0.98] tracking-[-0.04em] text-[var(--color-near-black)] transition-colors duration-200 group-hover:text-[var(--color-sienna)]">
                {edition.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-warm-slate)]">{edition.artist}</p>
            </div>
            <p className="text-sm leading-7 text-[var(--color-warm-slate)]">
              {edition.shortDescription || "Open the edition for context, availability, and production details."}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-rule)] pt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                {edition.availability}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                Open edition
              </div>
            </div>
          </div>
        </PublicSurface>
      </Link>
    </Reveal>
  );
}
