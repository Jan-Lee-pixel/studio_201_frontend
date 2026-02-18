import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

interface ExhibitionCardProps {
  slug: string;
  image: string;
  title: string;
  artist: string;
  date: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function ExhibitionCard({ slug, image, title, artist, date, delay = 0 }: ExhibitionCardProps) {
  return (
    <Reveal delay={delay} className="group cursor-pointer bg-[var(--color-bone)] border border-[var(--color-rule)] hover:border-[var(--color-sienna)] transition-colors duration-400 overflow-hidden">
      <Link href={`/exhibitions/${slug}`}>
        <div className="aspect-[3/2] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover filter saturate-80 transition-all duration-400 ease-out group-hover:saturate-100 group-hover:brightness-105"
          />
        </div>
        <div className="p-7 pb-8">
          <div className="font-sub italic text-sm text-[var(--color-warm-slate)] mb-3">{date}</div>
          <h3 className="font-display text-[22px] font-normal tracking-[-0.01em] leading-tight mb-2 text-[var(--color-near-black)]">
            {title}
          </h3>
          <div className="font-body text-[13px] text-[var(--color-warm-slate)]">{artist}</div>
        </div>
      </Link>
    </Reveal>
  );
}
