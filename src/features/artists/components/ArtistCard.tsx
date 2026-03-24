import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";

interface ArtistCardProps {
  slug: string;
  image?: string | null;
  name: string;
  medium?: string | null;
  note?: string | null;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function ArtistCard({ slug, image, name, medium, note, delay = 0 }: ArtistCardProps) {
  return (
    <Reveal delay={delay} className="group cursor-pointer">
      <Link href={`/artists/${slug}`} className="block h-full">
        <article className="flex h-full flex-col transition-transform duration-200 group-hover:-translate-y-1">
          <div className="aspect-[4/5] overflow-hidden bg-[var(--color-bone)]">
            {image ? (
              <img
                src={image}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <StudioImagePlaceholder className="h-full w-full" markClassName="w-18 md:w-20" />
            )}
          </div>

          <div className="px-1 pb-1 pt-4">
            <div className="font-body text-[17px] font-semibold leading-tight tracking-[0.01em] text-[var(--color-near-black)]">
              {name}
            </div>
            {medium ? (
              <div className="mt-1 font-sub text-[14px] italic text-[var(--color-warm-slate)]">{medium}</div>
            ) : null}
            {note ? (
              <p className="mt-2 text-[13px] leading-6 text-[var(--color-warm-slate)]">{note}</p>
            ) : null}
          </div>
        </article>
      </Link>
    </Reveal>
  );
}
