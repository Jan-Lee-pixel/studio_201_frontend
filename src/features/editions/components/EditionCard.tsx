import Link from 'next/link';
import { clsx } from 'clsx';
import type { Edition } from '../types';

interface EditionCardProps {
  edition: Edition;
  delay?: number;
}

export function EditionCard({ edition, delay = 0 }: EditionCardProps) {
  return (
    <Link 
      href={`/editions/${edition.slug}`} 
      className={clsx(
        "group block opacity-0 translate-y-3 animate-slide-up",
        edition.isFeatured && "col-span-1 md:col-span-2"
      )}
      style={{ animationDelay: `${delay}00ms` }}
    >
      <div 
        className={clsx(
          "w-full overflow-hidden transition-transform duration-500 ease-[var(--ease-gallery)] group-hover:scale-[1.015]",
          edition.coverImage,
          edition.isFeatured ? "aspect-video" : "aspect-[3/4]"
        )}
      ></div>
      <div className="pt-4 md:pt-5">
        <p className="font-mono text-[8px] tracking-[0.22em] uppercase text-[var(--color-warm-slate)] mb-2">
          {edition.category} {edition.isFeatured && '— Featured'}
        </p>
        <h3 className="font-display text-[1.2rem] md:text-[1.4rem] font-normal leading-[1.25] mb-1.5 transition-colors group-hover:text-[var(--color-sienna)]">
          {edition.title}
        </h3>
        <p className="font-body text-[11px] text-[var(--color-warm-slate)] mb-3">
          {edition.artist}
        </p>
        <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--color-dust)]">
          {edition.availability}
        </p>
      </div>
    </Link>
  );
}
