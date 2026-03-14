"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ExhibitionCard } from "@/features/exhibitions/components/ExhibitionCard";
import { ArtistCard } from "@/features/artists/components/ArtistCard";
import { EventRow } from "@/features/events/components/EventRow";
import { ArchiveItem } from "@/features/exhibitions/components/ArchiveItem";
import { Reveal } from "@/components/animation/Reveal";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { artistService, PublicUserProfile } from "@/features/artists/services/artistService";
import { eventService, EventDto } from "@/features/events/services/eventService";

const heroFallback = {
  slug: "mga-paa-sa-alapaap",
  image: "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1800&q=80",
  title: "Mga Paa sa Alapaap",
  artist: "Maria Santos",
  date: "Oct 3 – Nov 28, 2025",
};

const upcomingFallback = [
  {
    slug: "lupa-at-langit",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
    title: "Lupa at Langit",
    artist: "Jun Manlangit",
    date: "Opening Nov 30, 2025",
  },
  {
    slug: "ulan-sa-disyembre",
    image: "https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=800&q=80",
    title: "Ulan sa Disyembre",
    artist: "Elena Yap",
    date: "Opening Jan 15, 2026",
  },
  {
    slug: "dagat-ng-alaala",
    image: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80",
    title: "Dagat ng Alaala",
    artist: "Carlo Reyes",
    date: "Opening Mar 5, 2026",
  },
];

const artistFallback = [
  {
    slug: "maria-santos",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    name: "Maria Santos",
    medium: "Painting, Mixed Media",
  },
  {
    slug: "jun-manlangit",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    name: "Jun Manlangit",
    medium: "Sculpture, Installation",
  },
  {
    slug: "elena-yap",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    name: "Elena Yap",
    medium: "Photography, Video",
  },
  {
    slug: "carlo-reyes",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    name: "Carlo Reyes",
    medium: "Drawing, Printmaking",
  },
];

const eventsFallback = [
  {
    date: "Nov 5, 2025",
    day: "Wednesday",
    type: "Artist Talk",
    title: "Painting as Memory",
    subtitle: "A Conversation with Maria Santos",
    venue: "Studio 201",
    time: "7:00 PM",
  },
  {
    date: "Nov 12, 2025",
    day: "Wednesday",
    type: "Opening Night",
    title: "Mga Paa sa Alapaap",
    subtitle: "Maria Santos",
    venue: "Studio 201",
    time: "6:00 PM",
  },
  {
    date: "Dec 2, 2025",
    day: "Tuesday",
    type: "Workshop [External]",
    title: "Relief Printmaking",
    subtitle: "with Jun Manlangit",
    venue: "Sugbo Mercado",
    time: "2:00 PM",
    isExternal: true,
  },
  {
    date: "Dec 15, 2025",
    day: "Monday",
    type: "Symposium",
    title: "Contemporary Art in the Visayas",
    subtitle: "Panel Discussion",
    venue: "Studio 201",
    time: "10:00 AM",
  },
];

const archiveFallback = [
  {
    slug: "halina-at-luha",
    image: "https://images.unsplash.com/photo-1590907047706-ee9c08cf3189?w=800&q=80",
    title: "Halina at Luha",
    meta: "Maria Santos — 2024",
  },
  {
    slug: "tahanan",
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80",
    title: "Tahanan",
    meta: "Group Exhibition — 2024",
  },
  {
    slug: "sa-pamamagitan-ng-kahoy",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80",
    title: "Sa Pamamagitan ng Kahoy",
    meta: "Jun Manlangit — 2023",
  },
];

const formatDateRange = (start?: string, end?: string) => {
  if (!start) return "Dates TBA";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const startStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (!endDate) return startStr;
  const endStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} – ${endStr}`;
};

const formatOpeningLabel = (start?: string) => {
  if (!start) return "Upcoming";
  const date = new Date(start);
  return date > new Date()
    ? `Opening ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : "Now on View";
};

const formatEventDate = (dateStr?: string) => {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatEventDay = (dateStr?: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
};

export default function Home() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [archiveExhibitions, setArchiveExhibitions] = useState<Exhibition[]>([]);
  const [artists, setArtists] = useState<PublicUserProfile[]>([]);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const results = await Promise.allSettled([
        exhibitionService.getExhibitions(),
        exhibitionService.getArchiveExhibitions(),
        artistService.getArtists(),
        eventService.getEvents(),
      ]);

      if (!mounted) return;

      if (results[0].status === "fulfilled") setExhibitions(results[0].value);
      if (results[1].status === "fulfilled") setArchiveExhibitions(results[1].value);
      if (results[2].status === "fulfilled") setArtists(results[2].value);
      if (results[3].status === "fulfilled") setEvents(results[3].value);
      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const featuredExhibition = useMemo(() => {
    if (exhibitions.length === 0) return null;
    return exhibitions.find((ex) => ex.isFeatured) || exhibitions[0];
  }, [exhibitions]);

const hero = featuredExhibition
    ? {
        slug: featuredExhibition.slug,
        image: featuredExhibition.coverImageUrl || heroFallback.image,
        title: featuredExhibition.title,
        artist: "Studio 201",
        date: formatDateRange(featuredExhibition.startDate, featuredExhibition.endDate),
        label:
          featuredExhibition.startDate && new Date(featuredExhibition.startDate) > new Date()
            ? "Upcoming Exhibition"
            : "Now on View",
      }
    : { ...heroFallback, label: "Now on View" };

  const upcomingExhibitions = useMemo(() => {
    if (exhibitions.length === 0) return upcomingFallback;
    const now = new Date();
    const upcoming = exhibitions.filter((ex) => ex.startDate && new Date(ex.startDate) > now);
    const pool = upcoming.length > 0 ? upcoming : exhibitions;
    const filtered = featuredExhibition
      ? pool.filter((ex) => ex.id !== featuredExhibition.id)
      : pool;

    return filtered.slice(0, 3).map((ex) => ({
      slug: ex.slug,
      image: ex.coverImageUrl || upcomingFallback[0].image,
      title: ex.title,
      artist: "Group Exhibition",
      date: formatOpeningLabel(ex.startDate),
    }));
  }, [exhibitions, featuredExhibition]);

  const featuredArtists = useMemo(() => {
    if (artists.length === 0) return artistFallback;
    return artists.slice(0, 4).map((artist) => ({
      slug: artist.slug,
      image: artist.profileImageUrl || artistFallback[0].image,
      name: artist.fullName,
      medium: "Mixed Media",
    }));
  }, [artists]);

  const featuredEvents = useMemo(() => {
    if (events.length === 0) return eventsFallback;
    const now = new Date();
    const sorted = [...events].sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });

    const upcoming = sorted.filter((ev) => {
      const date = ev.endDate || ev.startDate;
      if (!date) return true;
      return new Date(date) >= now;
    });

    const pool = upcoming.length > 0 ? upcoming : sorted;

    return pool.slice(0, 4).map((ev) => ({
      slug: ev.slug,
      date: formatEventDate(ev.startDate),
      day: formatEventDay(ev.startDate),
      type: ev.type || "Event",
      title: ev.title,
      subtitle: ev.subtitle || "",
      venue: ev.venue || "Studio 201",
      time: ev.timeLabel || "",
      isExternal: ev.isExternal,
      hasDocumentation: ev.hasDocumentation,
    }));
  }, [events]);

  const archiveItems = useMemo(() => {
    if (archiveExhibitions.length === 0) return archiveFallback;

    return archiveExhibitions.slice(0, 3).map((ex) => {
      const year = ex.endDate ? new Date(ex.endDate).getFullYear() : ex.startDate ? new Date(ex.startDate).getFullYear() : "";
      return {
        slug: ex.slug,
        image: ex.coverImageUrl || archiveFallback[0].image,
        title: ex.title,
        meta: year ? `${year}` : "Archive Exhibition",
      };
    });
  }, [archiveExhibitions]);

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden">
        <img
          src={hero.image}
          alt={hero.title}
          className="absolute inset-0 w-full h-full object-cover animate-hero-reveal origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,22,15,0.82)] via-[rgba(23,22,15,0.1)_55%] to-transparent" />

        <div className="absolute bottom-18 left-6 right-6 md:left-12 md:right-12 max-w-[680px]">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--color-sienna)] mb-5 opacity-0 translate-y-3 animate-slide-up [animation-delay:200ms]">
            {hero.label}
          </div>
          <h1 className="font-display text-[clamp(48px,7vw,88px)] font-normal leading-[1.05] tracking-[-0.02em] text-[var(--color-cream)] mb-4 opacity-0 translate-y-3 animate-slide-up [animation-delay:320ms]">
            {hero.title}
          </h1>
          <div className="font-sub text-xl italic font-light text-[var(--color-dust)] mb-2 opacity-0 translate-y-3 animate-slide-up [animation-delay:400ms]">
            {hero.artist}
          </div>
          <div className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.06em] mb-9 opacity-0 translate-y-3 animate-slide-up [animation-delay:460ms]">
            {hero.date}
          </div>
          <div className="opacity-0 translate-y-3 animate-slide-up [animation-delay:540ms]">
            <Link
              href={`/exhibitions/${hero.slug}`}
              className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-cream)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
            >
              View Exhibition →
            </Link>
          </div>
        </div>

        <div className="absolute bottom-9 right-12 flex flex-col items-center gap-2 opacity-0 animate-slide-up [animation-delay:800ms] hidden md:flex">
          <div className="w-[1px] h-12 bg-[rgba(240,237,229,0.2)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-[rgba(240,237,229,0.6)] before:animate-scroll-drop"></div>
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[rgba(240,237,229,0.4)] writing-vertical-rl">Scroll</span>
        </div>
      </section>

      {/* UPCOMING EXHIBITIONS */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-parchment)]">
        <Reveal><SectionLabel>Upcoming Exhibitions</SectionLabel></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px] mt-16">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-[var(--color-rule)] bg-white/70">
                <div className="aspect-[4/3] bg-white/60" />
                <div className="p-4">
                  <div className="h-4 bg-white/70 mb-2" />
                  <div className="h-3 bg-white/60 w-2/3" />
                </div>
              </div>
            ))
          ) : (
            upcomingExhibitions.map((ex, i) => (
              <ExhibitionCard
                key={`${ex.slug}-${i}`}
                slug={ex.slug}
                image={ex.image}
                title={ex.title}
                artist={ex.artist}
                date={ex.date}
                delay={((i % 3) + 1) as 1 | 2 | 3}
              />
            ))
          )}
        </div>
      </section>

      {/* FEATURED ARTISTS */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-linen)]">
        <Reveal><SectionLabel>Artists</SectionLabel></Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-16">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/70 border border-[var(--color-rule)]" />
                <div className="h-4 bg-white/60 mt-4" />
                <div className="h-3 bg-white/50 mt-2 w-2/3" />
              </div>
            ))
          ) : (
            featuredArtists.map((artist, i) => (
              <ArtistCard
                key={`${artist.slug}-${i}`}
                slug={artist.slug}
                image={artist.image}
                name={artist.name}
                medium={artist.medium}
                delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
              />
            ))
          )}
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-parchment)]">
        <Reveal><SectionLabel>Events</SectionLabel></Reveal>
        <div className="mt-16">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/70 border border-[var(--color-rule)]" />
              ))}
            </div>
          ) : (
            featuredEvents.map((event, i) => (
              <EventRow
                key={`${event.title}-${i}`}
                {...event}
                delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}
              />
            ))
          )}
        </div>
        <div className="mt-12">
          <Reveal>
            <Link
              href="/events"
              className="relative inline-block font-body font-medium text-sm tracking-[0.02em] transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
            >
              View all events →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ARCHIVE PREVIEW */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-linen)]">
        <Reveal><SectionLabel>Selected Archive</SectionLabel></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-white/70 border border-[var(--color-rule)]" />
                <div className="h-4 bg-white/60 mt-4" />
                <div className="h-3 bg-white/50 mt-2 w-2/3" />
              </div>
            ))
          ) : (
            archiveItems.map((item, i) => (
              <ArchiveItem
                key={`${item.slug}-${i}`}
                slug={item.slug}
                image={item.image}
                title={item.title}
                meta={item.meta}
                delay={((i % 3) + 1) as 1 | 2 | 3}
              />
            ))
          )}
        </div>
        <div className="mt-12">
          <Reveal>
            <Link
              href="/archive"
              className="relative inline-block font-body font-medium text-sm tracking-[0.02em] transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
            >
              View full archive →
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
