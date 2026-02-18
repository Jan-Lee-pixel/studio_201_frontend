import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

interface ArtistCardProps {
  slug: string;
  image: string;
  name: string;
  medium: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function ArtistCard({ slug, image, name, medium, delay = 0 }: ArtistCardProps) {
  return (
    <Reveal delay={delay} className="group cursor-pointer">
      <Link href={`/artists/${slug}`}>
        <div className="aspect-[2/3] overflow-hidden mb-5">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-filter duration-400 ease-out group-hover:brightness-90"
          />
        </div>
        <div className="font-display text-lg text-[var(--color-near-black)] mb-1.5 relative inline-block">
          {name}
          <span className="absolute bottom-[-3px] left-0 w-full h-[1px] bg-[var(--color-sienna)] scale-x-0 origin-left transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        </div>
        <div className="font-sub italic text-[13px] text-[var(--color-warm-slate)]">{medium}</div>
      </Link>
    </Reveal>
  );
}
