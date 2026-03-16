import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/animation/Reveal";
import { ArtworkCard } from "@/features/artworks/components/ArtworkCard";
import { EventRow } from "@/features/events/components/EventRow";

import { Metadata } from "next";

type PublicArtist = {
  id: string;
  fullName: string;
  slug: string;
  bio?: string;
  profileImageUrl?: string;
  cvUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
};

type PublicArtwork = {
  id: string;
  exhibitionId: string;
  artistId: string;
  title: string;
  description?: string | null;
  mediaAssetUrl?: string | null;
  createdAt: string;
};

type PortfolioItem = {
  id: string;
  artistId: string;
  title: string;
  description?: string | null;
  year?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  mediaAssetUrl?: string | null;
  createdAt: string;
};

type PublicExhibition = {
  id: string;
  title: string;
  slug: string;
  startDate?: string | null;
  endDate?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5203/api";

async function getArtist(slug: string): Promise<PublicArtist | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/Profile/artists/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getArtistArtworks(artistId: string): Promise<PublicArtwork[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/ArtworkSubmissions/public/artist/${artistId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getArtistPortfolioItems(artistId: string): Promise<PortfolioItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/Portfolio/artist/${artistId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getArtistExhibitions(artistId: string): Promise<PublicExhibition[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/Exhibitions/artist/${artistId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const formatExhibitionDate = (startDate?: string | null) => {
  if (!startDate) return { date: "Date TBA", day: "" };
  const dateObj = new Date(startDate);
  return {
    date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

const buttonClasses =
  "inline-block font-body text-xs font-normal tracking-[0.08em] uppercase px-7 py-3 border bg-transparent cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.25,0,0,1)] rounded-none border-[var(--color-near-black)] text-[var(--color-near-black)] hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]";

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

  const portfolioVisible = portfolioItems.filter((item) => Boolean(item.mediaAssetUrl)).slice(0, 6);
  const submissionsVisible = artworks.filter((artwork) => Boolean(artwork.mediaAssetUrl)).slice(0, 6);
  const visibleArtworks = portfolioVisible.length > 0 ? portfolioVisible : submissionsVisible;
  const usingPortfolio = portfolioVisible.length > 0;
  const socialLinks = [
    { label: "Instagram", url: artist.instagramUrl },
    { label: "Facebook", url: artist.facebookUrl },
    { label: "YouTube", url: artist.youtubeUrl },
  ].filter((link) => Boolean(link.url));

  const nameParts = artist.fullName.split(" ");
  const firstName = nameParts[0] || artist.fullName;
  const lastName = nameParts.slice(1).join(" ");

  return (
    <div className="pt-20">
      {/* HERO */}
      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] lg:grid-cols-[420px_1fr] min-h-screen">
        <div className="relative h-[60vw] max-h-[480px] overflow-hidden bg-[var(--color-bone)] md:sticky md:top-0 md:h-screen md:max-h-none md:self-start">
          <img
            src={artist.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"}
            alt={artist.fullName}
            className="block w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-20 flex flex-col justify-end">
          <Reveal>
            <h1 className="font-display text-[clamp(36px,5vw,60px)] font-normal tracking-[-0.02em] leading-[1.1] mb-3 text-[var(--color-near-black)]">
              {firstName}
              {lastName ? (
                <>
                  <br />
                  {lastName}
                </>
              ) : null}
            </h1>
            <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-dust)] uppercase mb-12">
              Studio 201 Artist
            </div>

            <p className="font-sub italic text-xl font-light text-[var(--color-warm-slate)] leading-[1.6] mb-8">
              {artist.bio || "Artist bio will appear here once provided."}
            </p>

            <p className="text-base leading-[1.75] text-[var(--color-warm-slate)] max-w-[540px] mb-6">
              Artist profile details will appear here once provided. This space is reserved for practice notes, materials, and context for the body of work.
            </p>

            <p className="text-base leading-[1.75] text-[var(--color-warm-slate)] max-w-[540px]">
              Upcoming exhibitions and public programs will be listed below as they are scheduled.
            </p>

            {(artist.cvUrl || socialLinks.length > 0) && (
              <div className="mt-12 flex flex-wrap gap-6 items-center">
                {artist.cvUrl && (
                  <a href={artist.cvUrl} target="_blank" rel="noreferrer" className={buttonClasses}>
                    Download CV
                  </a>
                )}
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url as string}
                    target="_blank"
                    rel="noreferrer"
                    className="relative inline-block font-body text-[13px] text-[var(--color-warm-slate)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            )}
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
