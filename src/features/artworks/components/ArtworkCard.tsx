import { Reveal } from "@/components/animation/Reveal";

interface ArtworkCardProps {
  image?: string | null;
  title: string;
  meta: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function ArtworkCard({ image, title, meta, delay = 0 }: ArtworkCardProps) {
  return (
    <Reveal delay={delay} className="group cursor-pointer">
      <div className="border border-[var(--color-rule)] overflow-hidden mb-4 transition-colors duration-400 group-hover:border-[var(--color-sienna)]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full aspect-[4/3] object-cover transition-brightness duration-400 ease-out group-hover:brightness-90"
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-[radial-gradient(circle_at_top,rgba(181,96,58,0.25),rgba(23,22,15,0.9))]" />
        )}
      </div>
      <div className="font-body text-[15px] font-medium text-[var(--color-near-black)] mb-1">
        {title}
      </div>
      <div className="font-body text-[13px] text-[var(--color-dust)]">
        {meta}
      </div>
    </Reveal>
  );
}
