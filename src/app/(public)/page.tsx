"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ExhibitionCard } from "@/features/exhibitions/components/ExhibitionCard";
import { ArtistCard } from "@/features/artists/components/ArtistCard";
import { EventRow } from "@/features/events/components/EventRow";
import { ArchiveItem } from "@/features/exhibitions/components/ArchiveItem";
import { Reveal } from "@/components/animation/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { artistService, PublicUserProfile } from "@/features/artists/services/artistService";
import { eventService, EventDto } from "@/features/events/services/eventService";

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
        image: featuredExhibition.coverImageUrl || null,
        title: featuredExhibition.title,
        artist: "Studio 201",
        date: formatDateRange(featuredExhibition.startDate, featuredExhibition.endDate),
        label:
          featuredExhibition.startDate && new Date(featuredExhibition.startDate) > new Date()
            ? "Upcoming Exhibition"
            : "Now on View",
      }
    : {
        slug: "",
        image: null,
        title: "Studio 201",
        artist: "Exhibitions coming soon",
        date: "",
        label: "Studio 201",
      };
  const heroLink = featuredExhibition ? `/exhibitions/${hero.slug}` : "/exhibitions";
  const heroCta = featuredExhibition ? "View Exhibition →" : "Explore Exhibitions →";

  const upcomingExhibitions = useMemo(() => {
    if (exhibitions.length === 0) return [];
    const now = new Date();
    const upcoming = exhibitions.filter((ex) => ex.startDate && new Date(ex.startDate) > now);
    const pool = upcoming.length > 0 ? upcoming : exhibitions;
    const filtered = featuredExhibition
      ? pool.filter((ex) => ex.id !== featuredExhibition.id)
      : pool;

    return filtered.slice(0, 3).map((ex) => ({
      slug: ex.slug,
      image: ex.coverImageUrl || null,
      title: ex.title,
      artist: "Studio 201",
      date: formatOpeningLabel(ex.startDate),
    }));
  }, [exhibitions, featuredExhibition]);

  const featuredArtists = useMemo(() => {
    if (artists.length === 0) return [];
    return artists.slice(0, 4).map((artist) => ({
      slug: artist.slug,
      image: artist.profileImageUrl || null,
      name: artist.fullName,
      medium: "",
    }));
  }, [artists]);

  const featuredEvents = useMemo(() => {
    if (events.length === 0) return [];
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
    if (archiveExhibitions.length === 0) return [];

    return archiveExhibitions.slice(0, 3).map((ex) => {
      const year = ex.endDate ? new Date(ex.endDate).getFullYear() : ex.startDate ? new Date(ex.startDate).getFullYear() : "";
      return {
        slug: ex.slug,
        image: ex.coverImageUrl || null,
        title: ex.title,
        meta: year ? `${year}` : "Archive Exhibition",
      };
    });
  }, [archiveExhibitions]);

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden">
        {hero.image ? (
          <img
            src={hero.image}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover animate-hero-reveal origin-center"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(181,96,58,0.35),rgba(23,22,15,0.95))]" />
        )}
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
          {hero.date ? (
            <div className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.06em] mb-9 opacity-0 translate-y-3 animate-slide-up [animation-delay:460ms]">
              {hero.date}
            </div>
          ) : null}
          <div className="opacity-0 translate-y-3 animate-slide-up [animation-delay:540ms]">
            <Link
              href={heroLink}
              className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-cream)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
            >
              {heroCta}
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
              <div key={i} className="border border-[var(--color-rule)] bg-white/70">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4">
                  <Skeleton className="skeleton-line w-[70%] mb-2" />
                  <Skeleton className="skeleton-line w-[55%]" />
                </div>
              </div>
            ))
          ) : (
            upcomingExhibitions.length === 0 ? (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 text-[var(--color-warm-slate)] font-mono text-xs tracking-[0.2em] uppercase">
                No upcoming exhibitions yet
              </div>
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
            )
          )}
        </div>
      </section>

      {/* FEATURED ARTISTS */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-linen)]">
        <Reveal><SectionLabel>Artists</SectionLabel></Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-16">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4]" />
                <Skeleton className="skeleton-line w-[70%] mt-4" />
                <Skeleton className="skeleton-line w-[55%] mt-2" />
              </div>
            ))
          ) : (
            featuredArtists.length === 0 ? (
              <div className="col-span-2 md:col-span-4 text-center py-16 text-[var(--color-warm-slate)] font-mono text-xs tracking-[0.2em] uppercase">
                No artists yet
              </div>
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
            )
          )}
        </div>
        <div className="mt-12">
          <Reveal>
            <Link
              href="/artists"
              className="relative inline-block font-body font-medium text-sm tracking-[0.02em] transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
            >
              View all artists →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-parchment)]">
        <Reveal><SectionLabel>Events</SectionLabel></Reveal>
        <div className="mt-16">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            featuredEvents.length === 0 ? (
              <div className="text-center py-10 text-[var(--color-warm-slate)] font-mono text-xs tracking-[0.2em] uppercase">
                No events scheduled
              </div>
            ) : (
              featuredEvents.map((event, i) => (
                <EventRow
                  key={`${event.title}-${i}`}
                  {...event}
                  delay={((i % 5) + 1) as 1 | 2 | 3 | 4 | 5}
                />
              ))
            )
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
              <div key={i}>
                <Skeleton className="aspect-[4/3]" />
                <Skeleton className="skeleton-line w-[70%] mt-4" />
                <Skeleton className="skeleton-line w-[55%] mt-2" />
              </div>
            ))
          ) : (
            archiveItems.length === 0 ? (
              <div className="col-span-1 md:col-span-3 text-center py-16 text-[var(--color-warm-slate)] font-mono text-xs tracking-[0.2em] uppercase">
                Archive coming soon
              </div>
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
            )
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
