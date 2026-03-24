import Link from "next/link";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import { Reveal } from "@/components/animation/Reveal";
import { getCatalogItemHref } from "@/features/merch/utils/publicCatalog";

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
  hrefOverride?: string;
  channelLabel?: string;
}

export function MerchCard({
  slug,
  title,
  priceLabel,
  channel,
  image,
  delay = 1,
  hrefOverride,
  channelLabel,
}: MerchCardProps) {
  const href = hrefOverride || getCatalogItemHref(slug, channel);

  return (
    <Reveal delay={delay}>
      <Link href={href} className="group block h-full">
        <article className="flex h-full flex-col transition-transform duration-200 group-hover:-translate-y-1">
          <div className="flex aspect-square items-center justify-center overflow-hidden bg-white p-1 md:p-2">
            {image ? (
              <img
                src={image}
                alt={title}
                className="block h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <StudioImagePlaceholder className="h-full w-full" markClassName="w-12" />
            )}
          </div>
          <div className="px-1 pb-1 pt-3">
            {channelLabel ? (
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)]">
                {channelLabel}
              </div>
            ) : null}
            <h3 className="mt-0.5 font-body text-[15px] font-semibold leading-[1.28] tracking-[0.01em] text-[var(--color-near-black)] md:text-[16px]">
              {title}
            </h3>
            <p className="mt-0.5 text-[14px] leading-6 text-[var(--color-near-black)]">
              {priceLabel || "Inquiry only"}
            </p>
          </div>
        </article>
      </Link>
    </Reveal>
  );
}
