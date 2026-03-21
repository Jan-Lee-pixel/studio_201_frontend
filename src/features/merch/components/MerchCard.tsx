import Link from "next/link";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import { Reveal } from "@/components/animation/Reveal";

interface MerchCardProps {
  slug: string;
  title: string;
  itemType: string;
  artistName?: string | null;
  shortNote?: string | null;
  priceLabel?: string | null;
  channel: "merch" | "backroom";
  image?: string | null;
  delay?: 1 | 2 | 3 | 4;
}

function formatItemType(value: string) {
  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function MerchCard({
  slug,
  title,
  itemType,
  artistName,
  shortNote,
  priceLabel,
  channel,
  image,
  delay = 1,
}: MerchCardProps) {
  return (
    <Reveal delay={delay}>
      <Link href={`/merch/${slug}`} className="group block h-full">
        <div className="overflow-hidden border border-[var(--color-rule)] bg-white transition-colors duration-300 group-hover:bg-[var(--color-bone)]/30">
          <div className="flex h-[280px] items-center justify-center overflow-hidden bg-[var(--color-bone)] p-6 md:h-[300px] md:p-8">
            {image ? (
              <img
                src={image}
                alt={title}
                className="block max-h-[220px] w-auto max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02] md:max-h-[240px]"
              />
            ) : (
              <StudioImagePlaceholder className="h-full w-full" markClassName="w-12" />
            )}
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              <span>{formatItemType(itemType)}</span>
              <span>{channel === "backroom" ? "Backroom" : "Merch"}</span>
            </div>
            <div>
              <h3 className="font-display text-[26px] leading-[0.98] tracking-[-0.03em] text-[var(--color-near-black)] md:text-[28px]">
                {title}
              </h3>
              {artistName ? (
                <p className="mt-2 text-sm text-[var(--color-warm-slate)]">{artistName}</p>
              ) : null}
            </div>
            {shortNote ? (
              <p className="text-sm leading-7 text-[var(--color-warm-slate)]">{shortNote}</p>
            ) : null}
            <div className="flex items-center justify-between gap-4 border-t border-[var(--color-rule)] pt-4 font-mono text-[10px] uppercase tracking-[0.14em]">
              <span className="text-[var(--color-near-black)]">{priceLabel || "Inquiry only"}</span>
              <span className="text-[var(--color-dust)] transition-colors duration-300 group-hover:text-[var(--color-near-black)]">
                Open item
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
