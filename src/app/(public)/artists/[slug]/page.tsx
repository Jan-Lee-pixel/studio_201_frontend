import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import { Reveal } from "@/components/animation/Reveal";
import { ArtworkCard } from "@/features/artworks/components/ArtworkCard";
import { EventRow } from "@/features/events/components/EventRow";
import { PublicProfileOwnerActions } from "@/features/artists/components/PublicProfileOwnerActions";
import {
  formatExhibitionDate,
  getArtist,
  getArtistArtworks,
  getArtistExhibitions,
  getArtistPortfolioItems,
} from "./artistData";

import { Metadata } from "next";

// dynamic metadata
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
      <div className="min-h-screen flex items-center justify-center font-dm-mono text-gray-500 uppercase tracking-widest text-sm bg-[var(--color-charcoal)]">
        Artist Not Found
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
  const showViewAllWorksLink =
    (usingPortfolio && (portfolioPublicItems.length > 6 || approvedSubmissionWorks.length > 0)) ||
    (!usingPortfolio && approvedSubmissionWorks.length > 6);
  const socialLinks = [
    { label: "Instagram", url: artist.instagramUrl },
    { label: "Facebook", url: artist.facebookUrl },
    { label: "YouTube", url: artist.youtubeUrl },
  ].filter((link) => Boolean(link.url));

  const nameParts = artist.fullName.split(" ");
  const firstName = nameParts[0] || artist.fullName;
  const lastName = nameParts.slice(1).join(" ");

  return (
    <div className="bg-[var(--color-parchment)] pt-28">
      <div className="px-6 pb-20 md:px-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[minmax(360px,430px)_minmax(0,1fr)]">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[34px] border border-[var(--color-rule)] bg-[var(--color-bone)] shadow-[0_20px_48px_rgba(27,20,14,0.08)]">
                <div className="aspect-[4/5]">
                  {artist.profileImageUrl ? (
                    <img
                      src={artist.profileImageUrl}
                      alt={artist.fullName}
                      className="block h-full w-full object-cover object-center"
                    />
                  ) : (
                    <StudioImagePlaceholder
                      className="h-full w-full"
                      markClassName="w-24 md:w-32"
                      label="Studio 201"
                    />
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-[34px] border border-[var(--color-rule)] bg-[rgba(255,253,250,0.78)] p-7 shadow-[0_20px_48px_rgba(27,20,14,0.05)] md:p-10 lg:p-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                  Public Artist Profile
                </div>
                <PublicProfileOwnerActions
                  artistId={artist.id}
                  artistSlug={artist.slug}
                  showManageArtworks={false}
                  topButton
                />
              </div>

              <h1 className="mt-6 font-display text-[clamp(42px,6vw,76px)] font-normal tracking-[-0.03em] leading-[0.98] text-[var(--color-near-black)]">
                {firstName}
                {lastName ? (
                  <>
                    <br />
                    {lastName}
                  </>
                ) : null}
              </h1>

              <div className="mt-5 font-mono text-[11px] tracking-[0.12em] text-[var(--color-dust)] uppercase">
                Studio 201 Artist
              </div>

              <p className="mt-10 max-w-[720px] whitespace-pre-line font-sub text-[clamp(24px,3vw,30px)] italic font-light leading-[1.5] text-[var(--color-warm-slate)]">
                {artist.bio || "Artist statement coming soon."}
              </p>

              {socialLinks.length > 0 ? (
                <div className="mt-10 flex flex-wrap gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url as string}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-cream)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-warm-slate)] transition-colors duration-300 hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>

      {/* SELECTED WORKS */}
      <div className="py-24 px-6 md:px-12 bg-[var(--color-linen)]">
        <Reveal>
          <SectionLabel>Selected Works</SectionLabel>
        </Reveal>
        {visibleArtworks.length === 0 ? (
          <div className="mt-10 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-dust)]">
            No public artworks yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
            {visibleArtworks.map((artwork, index) => {
              const meta =
                "year" in artwork || "medium" in artwork || "dimensions" in artwork
                  ? [artwork.year, artwork.medium, artwork.dimensions].filter(Boolean).join(" · ")
                  : artwork.description || "Artwork";
              return (
                <ArtworkCard
                  key={artwork.id}
                  image={artwork.mediaAssetUrl as string}
                  title={artwork.title}
                  meta={meta || "Artwork"}
                  delay={(index % 3) + 1 as 1 | 2 | 3}
                />
              );
            })}
          </div>
        )}
        {usingPortfolio ? (
          <p className="mt-6 text-xs font-mono uppercase tracking-[0.1em] text-[var(--color-dust)]">
            Curated portfolio
          </p>
        ) : null}
        {showViewAllWorksLink ? (
          <div className="mt-8">
            <Link
              href={`/artists/${artist.slug}/works`}
              className="inline-flex items-center justify-center border border-[var(--color-near-black)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
            >
              View All Works
            </Link>
          </div>
        ) : null}
      </div>

      {/* UPCOMING SHOWS */}
      <div className="py-20 px-6 md:px-12 max-w-[900px]">
        <Reveal>
          <SectionLabel>Upcoming Shows</SectionLabel>
        </Reveal>
        {exhibitions.length === 0 ? (
          <div className="mt-10 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-dust)]">
            No upcoming shows listed yet.
          </div>
        ) : (
          <div className="mt-12">
            {exhibitions.map((exhibition, index) => {
              const { date, day } = formatExhibitionDate(exhibition.startDate);
              return (
                <EventRow
                  key={exhibition.id}
                  slug={exhibition.slug}
                  hrefPrefix="/exhibitions"
                  date={date}
                  day={day}
                  type="Studio 201 Exhibition"
                  title={exhibition.title}
                  subtitle=""
                  venue="Studio 201"
                  time=""
                  delay={(index % 3) as 0 | 1 | 2}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
