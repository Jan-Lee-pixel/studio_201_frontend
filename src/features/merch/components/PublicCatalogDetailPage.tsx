import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { MerchGallery } from "@/features/merch/components/MerchGallery";
import { formatCatalogItemType } from "@/features/merch/utils/publicCatalog";
import type { PublicMerchItem } from "@/app/(public)/merch/merchData";

export function PublicCatalogDetailPage({
  item,
  channelLabel,
  backHref,
  backLabel,
  collectionLabel,
  introTitle,
  introCopy,
  alternateHref,
  alternateLabel,
}: {
  item: PublicMerchItem;
  channelLabel: string;
  backHref: string;
  backLabel: string;
  collectionLabel: string;
  introTitle: string;
  introCopy: string;
  alternateHref?: string;
  alternateLabel?: string;
}) {
  const inquiryHref = item.inquiryEmail
    ? `mailto:${item.inquiryEmail}?subject=${encodeURIComponent(`Inquiry about ${item.title}`)}`
    : null;
  const galleryImages =
    item.galleryImages && item.galleryImages.length > 0
      ? item.galleryImages
      : [item.primaryImageUrl, item.secondaryImageUrl, item.tertiaryImageUrl].filter(
          (image): image is string => Boolean(image),
        );
  const channelName = channelLabel.replace("Studio 201 ", "");

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-28">
      <div className="px-6 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-[1320px]">
          <Link
            href={backHref}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] hover:text-[var(--color-near-black)] md:text-[10px]"
          >
            {backLabel}
          </Link>
        </div>
      </div>

      <div className="px-6 pb-16 md:px-12 md:pb-20">
        <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)] lg:items-start lg:gap-10">
          <Reveal>
            <MerchGallery title={item.title} images={galleryImages} />
          </Reveal>

          <Reveal delay={1}>
            <div className="flex flex-col gap-6 lg:sticky lg:top-[104px] lg:gap-8">
              <div className="order-1 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">
                <span>{channelName}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--color-rule)]" />
                <span>{formatCatalogItemType(item.itemType)}</span>
              </div>

              <div className="order-2">
                <h1 className="font-body text-[clamp(30px,4.2vw,46px)] font-semibold leading-[1.03] tracking-[-0.03em] text-[var(--color-near-black)]">
                  {item.title}
                </h1>
                {item.artistName ? (
                  <p className="mt-3 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm md:leading-6">{item.artistName}</p>
                ) : null}
                <div className="mt-6 text-[clamp(24px,3vw,36px)] font-body font-semibold leading-none tracking-[-0.02em] text-[var(--color-near-black)]">
                  {item.priceLabel || "Inquiry only"}
                </div>
                <p className="mt-2 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm md:leading-6">Handled by inquiry</p>
              </div>

              <div className="order-3 flex flex-col gap-3">
                {inquiryHref ? (
                  <a
                    href={inquiryHref}
                    className="inline-flex min-h-[54px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-6 text-[12px] uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors duration-300 hover:bg-[var(--color-charcoal)] md:min-h-[52px] md:text-[11px]"
                  >
                    Inquire about this item
                  </a>
                ) : (
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">
                    Inquiry details available on request.
                  </div>
                )}

                <div className="flex flex-wrap gap-5 pt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">
                  <Link href={backHref} className="hover:text-[var(--color-near-black)]">
                    {backLabel}
                  </Link>
                  {alternateHref && alternateLabel ? (
                    <Link href={alternateHref} className="hover:text-[var(--color-near-black)]">
                      {alternateLabel}
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="order-4 border-y border-[var(--color-rule)] py-6">
                <div className="space-y-5">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">Collection</div>
                    <div className="mt-2 text-[15px] leading-7 text-[var(--color-near-black)] md:text-sm md:leading-6">{collectionLabel}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">Type</div>
                    <div className="mt-2 text-[15px] leading-7 text-[var(--color-near-black)] md:text-sm md:leading-6">{formatCatalogItemType(item.itemType)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">Inquiry</div>
                    <div className="mt-2 font-body text-[18px] font-semibold leading-6 text-[var(--color-near-black)]">
                      {introTitle}
                    </div>
                    <div className="mt-2 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">{introCopy}</div>
                  </div>
                </div>
              </div>

              <div className="order-5 space-y-4">
                {item.shortNote ? (
                  <p className="text-base leading-8 text-[var(--color-warm-slate)]">{item.shortNote}</p>
                ) : null}
                {item.description ? (
                  <div className="whitespace-pre-line text-[15px] leading-8 text-[var(--color-warm-slate)] md:text-sm">
                    {item.description}
                  </div>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
