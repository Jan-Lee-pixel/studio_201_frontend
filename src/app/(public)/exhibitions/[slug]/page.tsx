import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ScrollToSectionButton } from "@/components/ui/ScrollToSectionButton";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import type { PublicUserProfile } from "@/features/artists/services/artistService";
import type { PublicArtworkDto } from "@/features/artworks/services/artworkService";
import { ArtworkPreviewGrid } from "@/features/artworks/components/ArtworkPreviewGrid";
import { ExhibitionCoverFrame } from "@/features/exhibitions/components/ExhibitionCoverFrame";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { getPublicCollection, getPublicResource } from "@/lib/publicApi";

function formatDateRange(start?: string, end?: string) {
  if (!start) return "Dates to be announced";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const startLabel = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (!endDate) return startLabel;

  const endLabel = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

export default async function ExhibitionResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const exhibition = await getPublicResource<Exhibition>(`/Exhibitions/slug/${slug}`, {
    revalidate: 60,
    tags: [`exhibition-${slug}`, "public-exhibitions"],
  });

  if (!exhibition) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)] px-6 pt-32 text-center font-mono text-sm uppercase tracking-[0.16em] text-[var(--color-dust)]">
        Exhibition not found
      </div>
    );
  }

  const [artworks, allArtists] = await Promise.all([
    getPublicCollection<PublicArtworkDto>(`/ArtworkSubmissions/public/exhibition/${exhibition.id}`, {
      revalidate: 60,
      tags: [`exhibition-artworks-${exhibition.id}`],
    }),
    getPublicCollection<PublicUserProfile>("/Profile/artists", {
      revalidate: 300,
      tags: ["public-artists"],
    }),
  ]);

  const artistLookup = Object.fromEntries(allArtists.map((artist) => [artist.id, artist]));
  const uniqueArtistIds = Array.from(new Set(artworks.map((artwork) => artwork.artistId)));
  const artists = uniqueArtistIds
    .map((artistId) => artistLookup[artistId])
    .filter((artist): artist is PublicUserProfile => Boolean(artist));
  const galleryArtworks = artworks.filter((artwork) => Boolean(artwork.mediaAssetUrl));
  const artistNames = artists.map((artist) => artist.fullName);
  const heroArtistLabel =
    artistNames.length > 0
      ? `${artistNames.slice(0, 3).join(" · ")}${artistNames.length > 3 ? ` +${artistNames.length - 3}` : ""}`
      : "Artists to be announced";
  const exhibitionDescription = exhibition.description?.trim() || null;

  return (
    <div className="bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_36%,var(--color-bone)_100%)]">
      <section>
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 pb-14 pt-24 md:px-12 md:pb-24 md:pt-32 xl:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] xl:gap-10">
          <Reveal className="order-2 flex flex-col gap-6 xl:order-1 xl:gap-8 xl:pt-6">
            <div>
              <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-sienna)] before:block before:h-px before:w-8 before:bg-current before:content-['']">
                Exhibition
              </div>
              <h1 className="mt-5 max-w-[10ch] font-display text-[clamp(40px,11vw,92px)] leading-[0.9] tracking-[-0.06em] text-[var(--color-near-black)] md:mt-6 md:max-w-[11ch] md:leading-[0.86]">
                {exhibition.title}
              </h1>
              <div className="mt-4 font-sub text-[clamp(20px,5vw,28px)] italic text-[var(--color-warm-slate)] md:mt-5">
                {heroArtistLabel}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ScrollToSectionButton
                  targetId="works"
                  className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-[var(--color-near-black)] px-6 text-sm tracking-[0.04em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)] sm:w-auto"
                >
                  View Works
                </ScrollToSectionButton>
                <Link
                  href="/exhibitions"
                  className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full border border-[var(--color-rule)] bg-white/70 px-6 text-sm tracking-[0.04em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-white sm:w-auto"
                >
                  Browse Exhibitions
                </Link>
              </div>
            </div>

            <div className="mt-1 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--color-rule)] pt-5 sm:flex sm:flex-wrap sm:gap-x-8 sm:pt-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Dates</div>
                <div className="mt-2 text-sm text-[var(--color-near-black)]">{formatDateRange(exhibition.startDate, exhibition.endDate)}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Artists</div>
                <div className="mt-2 text-sm text-[var(--color-near-black)]">{artists.length || "TBA"}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Works</div>
                <div className="mt-2 text-sm text-[var(--color-near-black)]">{galleryArtworks.length || "TBA"} published</div>
              </div>
            </div>
          </Reveal>

          <Reveal className="order-1 self-start xl:order-2">
            <div className="overflow-hidden rounded-[26px] border border-[var(--color-rule)] bg-[rgba(255,255,255,0.82)] p-3 shadow-[0_24px_56px_rgba(33,28,24,0.08)] md:rounded-[30px] md:p-4 xl:sticky xl:top-[96px]">
              <div className="relative overflow-hidden rounded-[24px]">
                <ExhibitionCoverFrame
                  image={exhibition.coverImageUrl}
                  alt={exhibition.title}
                  className="w-full"
                  paddingClassName="p-3 md:p-5 xl:p-6"
                  imageClassName="h-auto w-auto max-h-[min(54vh,560px)] max-w-full md:max-h-[min(68vh,680px)]"
                />
                <div className="absolute inset-[7%] border border-[rgba(255,255,255,0.22)]" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[var(--color-parchment)] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div>
            <Reveal>
              <SectionLabel>Curatorial Note</SectionLabel>
            </Reveal>
            <Reveal>
              <div className="mt-8 max-w-[760px]">
                <p className="font-sub text-[clamp(24px,3vw,34px)] italic leading-[1.55] text-[var(--color-warm-slate)]">
                  {exhibitionDescription ||
                    "A curatorial note or exhibition statement will be added here when it is available."}
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="rounded-[26px] border border-[var(--color-rule)] bg-[rgba(255,255,255,0.84)] p-6 shadow-[0_16px_38px_rgba(33,28,24,0.04)]">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                Exhibition Details
              </div>
              <div className="mt-5 space-y-5">
                <div className="border-t border-[var(--color-rule)] pt-5 first:border-t-0 first:pt-0">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Dates</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--color-near-black)]">
                    {formatDateRange(exhibition.startDate, exhibition.endDate)}
                  </div>
                </div>
                <div className="border-t border-[var(--color-rule)] pt-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Participating Artists</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--color-near-black)]">{heroArtistLabel}</div>
                </div>
                <div className="border-t border-[var(--color-rule)] pt-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Works Published</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--color-near-black)]">
                    {galleryArtworks.length > 0
                      ? `${galleryArtworks.length} work${galleryArtworks.length === 1 ? "" : "s"} currently visible`
                      : "No works have been published yet"}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="works"
        className="scroll-mt-24 border-t border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-16 md:scroll-mt-28 md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-[1440px]">
          <Reveal>
            <SectionLabel>Works in Exhibition</SectionLabel>
          </Reveal>
          {galleryArtworks.length > 0 ? (
            <ArtworkPreviewGrid
              artworks={galleryArtworks.map((artwork) => ({
                id: artwork.id,
                title: artwork.title,
                imageUrl: artwork.mediaAssetUrl as string,
                artistName: artistLookup[artwork.artistId]?.fullName,
                category: artwork.category,
                artType: artwork.artType,
                description: artwork.description,
              }))}
            />
          ) : (
            <div className="mt-10 rounded-[26px] border border-dashed border-[var(--color-rule)] bg-[rgba(255,255,255,0.7)] px-6 py-12 text-center">
              <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                Works coming soon
              </div>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-warm-slate)]">
                No artworks have been published for this exhibition yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[var(--color-parchment)] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <Reveal>
            <SectionLabel>Artists in This Exhibition</SectionLabel>
          </Reveal>
          {artists.length === 0 ? (
            <div className="mt-10 rounded-[26px] border border-dashed border-[var(--color-rule)] bg-[rgba(255,255,255,0.72)] px-6 py-12 text-center">
              <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                Artists will be announced soon
              </div>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-warm-slate)]">
                Once artist records are connected to the works in this exhibition, they will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {artists.map((artist, index) => (
                <Reveal key={artist.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="overflow-hidden rounded-[24px] border border-[var(--color-rule)] bg-white/85 shadow-[0_16px_38px_rgba(33,28,24,0.04)] transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[var(--color-bone)]">
                      {artist.profileImageUrl ? (
                        <img src={artist.profileImageUrl} alt={artist.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <StudioImagePlaceholder className="h-full w-full" markClassName="w-16" label="Studio 201" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="font-display text-[30px] leading-[0.92] tracking-[-0.04em] text-[var(--color-near-black)]">
                        {artist.fullName}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--color-warm-slate)]">
                        {artist.bio?.trim()
                          ? `${artist.bio.slice(0, 110)}${artist.bio.length > 110 ? "..." : ""}`
                          : "View the artist profile for biography, selected works, and related exhibitions."}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <div className="mt-12">
              <Link
                href="/exhibitions"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--color-near-black)] px-5 text-sm tracking-[0.04em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
              >
                Return to Exhibitions
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
