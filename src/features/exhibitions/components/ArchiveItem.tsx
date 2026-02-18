import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

interface ArchiveItemProps {
  slug: string;
  image: string;
  title: string;
  meta: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function ArchiveItem({ slug, image, title, meta, delay = 0 }: ArchiveItemProps) {
  return (
    <Reveal delay={delay} className="group cursor-pointer">
      <Link href={`/exhibitions/${slug}`}>
        <div className="aspect-[3/2] overflow-hidden mb-4 bg-[var(--color-bone)]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover filter brightness-85 saturate-65 transition-all duration-500 ease-out group-hover:brightness-100 group-hover:saturate-100"
          />
        </div>
        <div className="font-display text-base font-normal text-[var(--color-warm-slate)] mb-1">
          {title}
        </div>
        <div className="font-mono text-[10px] text-[var(--color-dust)] tracking-[0.06em]">
          {meta}
        </div>
      </Link>
    </Reveal>
  );
}
