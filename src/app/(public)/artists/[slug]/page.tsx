import Link from "next/link";
import { Metadata } from "next";
import clsx from "clsx";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import { PublicProfileOwnerActions } from "@/features/artists/components/PublicProfileOwnerActions";
import { ArtworkPreviewGrid } from "@/features/artworks/components/ArtworkPreviewGrid";
import type { ArtworkPreviewItem } from "@/features/artworks/components/ArtworkPreviewGrid";
import { ExhibitionCoverFrame } from "@/features/exhibitions/components/ExhibitionCoverFrame";
import { WorkspaceStatusPill } from "@/components/ui/WorkspacePrimitives";
import {
  getArtist,
  getArtistArtworks,
  getArtistExhibitions,
  getArtistPortfolioItems,
  type PublicExhibition,
} from "./artistData";

function parseDateValue(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  const timestamp = date.getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  const startValue = parseDateValue(startDate);
  const endValue = parseDateValue(endDate);

  if (!startValue && !endValue) return "Dates to be announced";

  const startLabel = startValue
    ? new Date(startValue).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Opening date TBA";

  if (!endValue || endValue === startValue) {
    return startLabel;
  }

  const endLabel = new Date(endValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} - ${endLabel}`;
}

function getProgramState(exhibition: PublicExhibition) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startValue = parseDateValue(exhibition.startDate);
  const endValue = parseDateValue(exhibition.endDate) ?? startValue;

  if (startValue && startValue > today.getTime()) {
    return { label: "Upcoming", tone: "accent" as const, order: 1 };
  }

  if (endValue && endValue < today.getTime()) {
    return { label: "Archive", tone: "neutral" as const, order: 3 };
  }

  if (startValue || endValue) {
    return { label: "On View", tone: "success" as const, order: 0 };
  }

  return { label: "Program", tone: "warning" as const, order: 2 };
}

function orderExhibitions(exhibitions: PublicExhibition[]) {
  return [...exhibitions].sort((left, right) => {
    const leftState = getProgramState(left);
    const rightState = getProgramState(right);

    if (leftState.order !== rightState.order) {
      return leftState.order - rightState.order;
    }

    const leftDate = parseDateValue(left.startDate) ?? parseDateValue(left.endDate) ?? 0;
    const rightDate = parseDateValue(right.startDate) ?? parseDateValue(right.endDate) ?? 0;

    if (leftState.label === "Archive" && rightState.label === "Archive") {
      return rightDate - leftDate;
    }

    return leftDate - rightDate;
  });
}

function ProgramCard({
  exhibition,
  featured = false,
}: {
  exhibition: PublicExhibition;
  featured?: boolean;
}) {
  const state = getProgramState(exhibition);

  return (
    <Link
      href={`/exhibitions/${exhibition.slug}`}
      className={clsx(
        "group overflow-hidden rounded-[28px] border border-[rgba(26,24,20,0.1)] bg-white shadow-[0_18px_42px_rgba(33,28,24,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(26,24,20,0.22)]",
        featured && "lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:items-stretch",
      )}
    >
      {featured ? (
        <div className="relative min-h-[240px] overflow-hidden">
          <ExhibitionCoverFrame
            image={exhibition.coverImageUrl}
            alt={exhibition.title}
            className="absolute inset-0"
            paddingClassName="p-6"
            imageClassName="h-auto w-auto max-h-full max-w-full"
          />
        </div>
      ) : null}

      <div className="flex h-full flex-col p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            Studio 201 Exhibition
          </div>
          <WorkspaceStatusPill tone={state.tone}>{state.label}</WorkspaceStatusPill>
        </div>

        <h3
          className={clsx(
            "font-display leading-[0.92] tracking-[-0.04em] text-[var(--color-near-black)]",
            featured ? "mt-6 text-[clamp(34px,4vw,48px)]" : "mt-5 text-[30px]",
          )}
        >
          {exhibition.title}
        </h3>

        <p className="mt-4 text-sm leading-7 text-[var(--color-warm-slate)]">
          {formatDateRange(exhibition.startDate, exhibition.endDate)}
        </p>

        {exhibition.description ? (
          <p className="mt-4 max-w-[48ch] text-sm leading-7 text-[var(--color-warm-slate)]">
            {exhibition.description}
          </p>
        ) : null}

        <div className="mt-auto pt-6">
          <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
            View exhibition
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              {"->"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);
  if (!artist) {
    return { title: "Artist - Studio 201" };
  }
  return {
    title: `${artist.fullName} - Studio 201`,
    description: artist.bio || `Explore works and exhibitions by ${artist.fullName}.`,
  };
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = await getArtist(slug);

  if (!artist) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-charcoal)] font-mono text-sm uppercase tracking-[0.16em] text-[var(--color-dust)]">
        Artist not found
      </div>
    );
  }

  const [portfolioItems, artworks, exhibitions] = await Promise.all([
    getArtistPortfolioItems(artist.id),
    getArtistArtworks(artist.id),
    getArtistExhibitions(artist.id),
  ]);

  const portfolioPublicItems = portfolioItems.filter((item) => Boolean(item.mediaAssetUrl));
  const approvedSubmissionWorks = artworks.filter((artwork) => Boolean(artwork.mediaAssetUrl));
  const portfolioVisible = portfolioPublicItems.slice(0, 6);
  const submissionsVisible = approvedSubmissionWorks.slice(0, 6);
  const visibleArtworks = portfolioVisible.length > 0 ? portfolioVisible : submissionsVisible;
  const usingPortfolio = portfolioVisible.length > 0;
  const orderedExhibitions = orderExhibitions(exhibitions);
  const singleProgramCard = orderedExhibitions.length === 1;
  const activeProgramCount = orderedExhibitions.filter(
    (exhibition) => getProgramState(exhibition).label !== "Archive",
  ).length;
  const socialLinks = [
    { label: "Instagram", url: artist.instagramUrl },
    { label: "Facebook", url: artist.facebookUrl },
    { label: "YouTube", url: artist.youtubeUrl },
  ].filter((link) => Boolean(link.url));
  const showViewAllWorksLink =
    (usingPortfolio && (portfolioPublicItems.length > 6 || approvedSubmissionWorks.length > 0)) ||
    (!usingPortfolio && approvedSubmissionWorks.length > 6);
  const hasVisibleWorks = visibleArtworks.length > 0;

  const previewArtworks: ArtworkPreviewItem[] = visibleArtworks.map((artwork) => {
    const description =
      "year" in artwork || "medium" in artwork || "dimensions" in artwork
        ? [artwork.year, artwork.medium, artwork.dimensions, artwork.description].filter(Boolean).join(" · ")
        : artwork.description || "Approved exhibition work";

    return {
      id: artwork.id,
      title: artwork.title,
      imageUrl: artwork.mediaAssetUrl as string,
      category: artwork.category,
      artType: artwork.artType,
      description,
      artistName: artist.fullName,
    };
  });

  return (
    <div className="bg-[var(--color-parchment)]">
      <section className="px-6 pb-20 pt-28 md:px-12 md:pb-24">
        <div className="mx-auto grid max-w-[1440px] gap-8 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] xl:gap-14">
          <Reveal>
            <div className="xl:sticky xl:top-28">
              <div className="overflow-hidden rounded-[30px] border border-[var(--color-rule)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_18px_42px_rgba(33,28,24,0.06)]">
                <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-[var(--color-bone)]">
                  {artist.profileImageUrl ? (
                    <img
                      src={artist.profileImageUrl}
                      alt={artist.fullName}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <StudioImagePlaceholder className="h-full w-full" markClassName="w-20 md:w-24" />
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="min-w-0">
            <div className="rounded-[34px] border border-[var(--color-rule)] bg-[rgba(255,253,250,0.88)] p-7 shadow-[0_18px_42px_rgba(33,28,24,0.04)] md:p-10 lg:p-12">
              <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-sienna)] before:block before:h-px before:w-8 before:bg-current before:content-['']">
                Artist Profile
              </div>

              <h1 className="mt-6 max-w-[11ch] font-display text-[clamp(52px,7vw,96px)] leading-[0.88] tracking-[-0.06em] text-[var(--color-near-black)]">
                {artist.fullName}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <WorkspaceStatusPill tone="accent">Studio 201 artist</WorkspaceStatusPill>
                {activeProgramCount > 0 ? (
                  <WorkspaceStatusPill tone="success">
                    {activeProgramCount} live program{activeProgramCount === 1 ? "" : "s"}
                  </WorkspaceStatusPill>
                ) : null}
              </div>

              <p className="mt-8 max-w-[760px] whitespace-pre-line font-sub text-[clamp(24px,3vw,34px)] italic font-light leading-[1.55] text-[var(--color-warm-slate)]">
                {artist.bio?.trim() ||
                  "Artist statement coming soon."}
              </p>

              {socialLinks.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url as string}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:border-[var(--color-near-black)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}

              <div className="mt-10 flex flex-wrap gap-3 border-t border-[var(--color-rule)] pt-6">
                {hasVisibleWorks ? (
                  <Link
                    href={`/artists/${artist.slug}/works`}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-6 text-sm tracking-[0.04em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)]"
                  >
                    View Works
                  </Link>
                ) : null}
                <Link
                  href="/artists"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white/72 px-6 text-sm tracking-[0.04em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-white"
                >
                  Browse Artists
                </Link>
              </div>

              <PublicProfileOwnerActions artistId={artist.id} artistSlug={artist.slug} compact />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <Reveal>
            <SectionLabel>Selected Works</SectionLabel>
          </Reveal>

          {visibleArtworks.length === 0 ? (
            <div className="mt-10 rounded-[26px] border border-dashed border-[var(--color-rule)] bg-[rgba(255,255,255,0.72)] px-6 py-12 text-center">
              <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                No public works yet
              </div>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-warm-slate)]">
                Public works will appear here as they are published to the profile.
              </p>
            </div>
          ) : (
            <>
              <ArtworkPreviewGrid artworks={previewArtworks} />
              <div className={`mt-6 flex flex-wrap items-center gap-4 ${visibleArtworks.length === 1 ? "justify-center" : ""}`}>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                  {usingPortfolio ? "Curated from portfolio" : "Drawn from approved submissions"}
                </div>
                {showViewAllWorksLink ? (
                  <Link
                    href={`/artists/${artist.slug}/works`}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[var(--color-near-black)] px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
                  >
                    View all works
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[var(--color-parchment)] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
          <Reveal>
            <div className="max-w-[440px]">
              <SectionLabel>Program</SectionLabel>
              <h2 className="mt-6 font-display text-[clamp(34px,4vw,54px)] leading-[0.92] tracking-[-0.05em] text-[var(--color-near-black)]">
                Exhibitions connected to this artist.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[var(--color-warm-slate)]">
                See current, upcoming, and past Studio 201 exhibitions connected to this artist.
              </p>
            </div>
          </Reveal>

          <div>
            {orderedExhibitions.length === 0 ? (
              <div className="rounded-[26px] border border-dashed border-[var(--color-rule)] bg-[rgba(255,255,255,0.72)] px-6 py-12 text-center">
                <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                  Program details coming soon
                </div>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-warm-slate)]">
                  No exhibitions are connected to this artist profile yet.
                </p>
              </div>
            ) : singleProgramCard ? (
              <Reveal>
                <div className="max-w-[880px]">
                  <ProgramCard exhibition={orderedExhibitions[0]} featured />
                </div>
              </Reveal>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {orderedExhibitions.map((exhibition, index) => (
                  <Reveal key={exhibition.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
                    <ProgramCard exhibition={exhibition} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
