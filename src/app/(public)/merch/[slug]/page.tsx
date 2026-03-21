import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getPublicMerchBySlug } from "../merchData";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicMerchBySlug(slug);
  if (!item) {
    return { title: "Merch | Studio 201" };
  }
  return {
    title: `${item.title} | Studio 201`,
    description: item.shortNote || item.description || `Discover ${item.title} in the Studio 201 merch collection.`,
  };
}

function formatItemType(value: string) {
  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function MerchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublicMerchBySlug(slug);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-parchment)] font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-dust)]">
        Merch item not found
      </div>
    );
  }

  const inquiryHref = item.inquiryEmail
    ? `mailto:${item.inquiryEmail}?subject=${encodeURIComponent(`Inquiry about ${item.title}`)}`
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] pt-28">
      <div className="border-b border-[var(--color-rule)] px-6 py-5 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/merch"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)] hover:text-[var(--color-near-black)]"
          >
            Back to merch
          </Link>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            Inquiry-based release
          </div>
        </div>
      </div>

      <div className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-[1220px] gap-12 lg:grid-cols-[minmax(320px,460px)_minmax(0,1fr)]">
          <Reveal>
            <div className="mx-auto w-full max-w-[460px] overflow-hidden border border-[var(--color-rule)] bg-white">
              <div className="flex min-h-[360px] items-center justify-center bg-[var(--color-bone)] p-8 md:min-h-[520px] md:p-12">
                {item.primaryImageUrl ? (
                  <img
                    src={item.primaryImageUrl}
                    alt={item.title}
                    className="block max-h-[300px] w-auto max-w-full object-contain md:max-h-[420px]"
                  />
                ) : (
                  <StudioImagePlaceholder className="h-full w-full" markClassName="w-16" />
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="space-y-10">
              <SectionLabel>Studio 201 Merch</SectionLabel>

              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                <span>{item.channel === "backroom" ? "Backroom" : "Merch"}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--color-rule)]" />
                <span>{formatItemType(item.itemType)}</span>
                {item.artistName ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-[var(--color-rule)]" />
                    <span>{item.artistName}</span>
                  </>
                ) : null}
              </div>

              <div>
                <h1 className="font-display text-[clamp(44px,7vw,92px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-near-black)]">
                  {item.title}
                </h1>
                {item.shortNote ? (
                  <p className="mt-6 max-w-[720px] whitespace-pre-line font-sub text-[clamp(22px,3vw,32px)] italic font-light leading-[1.5] text-[var(--color-warm-slate)]">
                    {item.shortNote}
                  </p>
                ) : null}
              </div>

              <div className="border-y border-[var(--color-rule)]">
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="border-b border-[var(--color-rule)] px-0 py-5 md:border-r">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Type</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">{formatItemType(item.itemType)}</div>
                  </div>
                  <div className="border-b border-[var(--color-rule)] px-0 py-5 md:pl-8">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Collection</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">
                      {item.channel === "backroom" ? "Backroom selection" : "Public merch catalog"}
                    </div>
                  </div>
                  <div className="border-b border-[var(--color-rule)] px-0 py-5 md:border-b-0 md:border-r">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Availability</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">Handled by inquiry</div>
                  </div>
                  <div className="px-0 py-5 md:pl-8">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Price note</div>
                    <div className="mt-2 text-sm text-[var(--color-near-black)]">{item.priceLabel || "Available on request"}</div>
                  </div>
                </div>
              </div>

              {item.description ? (
                <div className="max-w-[720px] whitespace-pre-line text-sm leading-8 text-[var(--color-warm-slate)]">
                  {item.description}
                </div>
              ) : null}

              <div className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-6 md:p-8">
                <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
                  <div>
                    <div className="font-display text-[30px] leading-[1.08] tracking-[-0.03em] text-[var(--color-near-black)]">
                      Inquire instead of checking out.
                    </div>
                    <p className="mt-3 max-w-[48ch] text-sm leading-7 text-[var(--color-warm-slate)]">
                      Studio 201 keeps merch and backroom items inquiry-based so availability, pickup, shipping, and artist context can stay part of the conversation.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    {inquiryHref ? (
                      <a
                        href={inquiryHref}
                        className="inline-flex items-center justify-center border border-[var(--color-near-black)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
                      >
                        Inquire about this item
                      </a>
                    ) : (
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                        Inquiry details available on request.
                      </div>
                    )}
                    <Link
                      href="/merch"
                      className="inline-flex items-center justify-center border border-[var(--color-rule)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-dust)] transition-colors duration-300 hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
                    >
                      Browse more merch
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
