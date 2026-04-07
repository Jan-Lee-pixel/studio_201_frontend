import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sortPublicArtists, type PublicUserProfile } from "@/features/artists/services/artistService";
import type { EventDto } from "@/features/events/services/eventService";
import type { Exhibition } from "@/features/exhibitions/services/exhibitionService";
import {
  getArchiveExhibitions,
  getProgramExhibitions,
  getPublicArtists,
  getPublicEvents,
} from "@/lib/publicData";

const formatDateRange = (start?: string, end?: string) => {
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
};

const formatHeroLabel = (start?: string) => {
  if (!start) return "Current Program";
  const startDate = new Date(start);
  return startDate > new Date() ? "Upcoming Exhibition" : "Now on View";
};

const formatMonthLabel = (value?: string) => {
  if (!value) return "TBA";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDayLabel = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "long",
  });
};

function ProgramLink({
  href,
  eyebrow,
  title,
  description,
  meta,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col justify-between rounded-[22px] border border-[var(--color-rule)] bg-white/85 p-6 shadow-[0_14px_34px_rgba(33,28,24,0.04)] transition-transform duration-200 hover:-translate-y-1"
    >
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-sienna)] md:text-[10px]">{eyebrow}</div>
        <h3 className="mt-4 font-display text-[30px] leading-[0.96] tracking-[-0.04em] text-[var(--color-near-black)]">
          {title}
        </h3>
        <p className="mt-4 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">{description}</p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--color-rule)] pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">{meta}</span>
        <span className="text-[15px] text-[var(--color-sienna)] transition-transform duration-200 group-hover:translate-x-1 md:text-sm">
          Explore →
        </span>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [exhibitions, archiveExhibitions, artistsData, events] = await Promise.all([
    getProgramExhibitions(),
    getArchiveExhibitions(),
    getPublicArtists(),
    getPublicEvents(),
  ]);
  const artists = sortPublicArtists(artistsData);

  const featuredExhibition =
    exhibitions.find((exhibition) => exhibition.isFeatured) || exhibitions[0] || null;
  const heroImage = featuredExhibition?.coverImageUrl || null;
  const heroTitle = featuredExhibition?.title || "Studio 201";
  const heroLabel = formatHeroLabel(featuredExhibition?.startDate);
  const heroDates = formatDateRange(featuredExhibition?.startDate, featuredExhibition?.endDate);
  const heroLink = featuredExhibition ? `/exhibitions/${featuredExhibition.slug}` : "/exhibitions";

  const now = new Date();
  const upcomingExhibition = exhibitions
    .filter((exhibition) => exhibition.id !== featuredExhibition?.id)
    .find((exhibition) => exhibition.startDate && new Date(exhibition.startDate) > now);

  const sortedEvents = [...events].sort((left, right) => {
    const leftTime = left.startDate ? new Date(left.startDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.startDate ? new Date(right.startDate).getTime() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });

  const upcomingEvents = sortedEvents.filter((event) => {
    const date = event.endDate || event.startDate;
    return !date || new Date(date) >= now;
  });

  const featuredEvents = (upcomingEvents.length > 0 ? upcomingEvents : sortedEvents).slice(0, 3);
  const leadArtist = artists[0] || null;
  const supportingArtists = artists.slice(1, 4);
  const featuredArchive = archiveExhibitions.slice(0, 3);

  return (
    <div className="bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_32%,var(--color-bone)_100%)]">
      <section className="relative min-h-[100svh] overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={heroTitle}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(181,96,58,0.35),rgba(23,22,15,0.95))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,22,15,0.86)] via-[rgba(23,22,15,0.26)_50%] to-[rgba(23,22,15,0.14)] md:from-[rgba(23,22,15,0.82)] md:via-[rgba(23,22,15,0.18)_52%] md:to-[rgba(23,22,15,0.12)]" />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-14 pt-28 md:px-12 md:pb-24 md:pt-40">
          <Reveal className="max-w-[760px]">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-sienna)] md:text-[10px]">
              {heroLabel}
            </div>
            <h1 className="mt-4 max-w-[8ch] font-display text-[clamp(44px,13vw,94px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-cream)] md:mt-5 md:max-w-none md:leading-[0.92]">
              {heroTitle}
            </h1>
            <div className="mt-3 font-sub text-[clamp(20px,5vw,30px)] italic text-[rgba(240,237,229,0.86)] md:mt-4">
              Studio 201
            </div>
            <div className="mt-2 font-mono text-[12px] tracking-[0.08em] text-[rgba(240,237,229,0.66)] md:mt-3 md:text-[11px]">
              {heroDates}
            </div>
            <div className="mt-8 md:mt-10">
              <Link
                href={heroLink}
                className="relative inline-block text-[16px] tracking-[0.03em] text-[var(--color-cream)] after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 md:text-sm"
              >
                {featuredExhibition ? "View Exhibition →" : "Explore Exhibitions →"}
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-10 right-12 hidden flex-col items-center gap-2 md:flex">
          <div className="relative h-12 w-px overflow-hidden bg-[rgba(240,237,229,0.18)] before:absolute before:left-0 before:top-0 before:h-full before:w-full before:bg-[rgba(240,237,229,0.6)] before:animate-scroll-drop before:content-['']" />
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[rgba(240,237,229,0.42)] [writing-mode:vertical-rl]">
            Scroll
          </span>
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[rgba(250,248,244,0.74)] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <Reveal>
            <SectionLabel>This Month</SectionLabel>
          </Reveal>
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Reveal>
              <ProgramLink
                href={upcomingExhibition ? `/exhibitions/${upcomingExhibition.slug}` : heroLink}
                eyebrow={upcomingExhibition ? "Upcoming Exhibition" : "Current Program"}
                title={upcomingExhibition?.title || heroTitle}
                description={
                  upcomingExhibition
                    ? `${formatDateRange(upcomingExhibition.startDate, upcomingExhibition.endDate)}. Announced as part of the Studio 201 exhibition calendar.`
                    : "No second exhibition has been announced yet. Follow the current program and related events while the next show is being prepared."
                }
                meta={upcomingExhibition ? formatMonthLabel(upcomingExhibition.startDate) : heroDates}
              />
            </Reveal>

            <div className="grid gap-4">
              <Reveal>
                <ProgramLink
                  href={featuredEvents[0] ? `/events/${featuredEvents[0].slug}` : "/events"}
                  eyebrow="Programming"
                  title={featuredEvents[0]?.title || "Events move with the exhibition cycle."}
                  description={
                    featuredEvents[0]
                      ? `${featuredEvents[0].subtitle || "A public conversation, walkthrough, or gathering around the current show."}`
                      : "Openings, conversations, screenings, and public gatherings are posted here as they are announced."
                  }
                  meta={
                    featuredEvents[0]
                      ? `${formatMonthLabel(featuredEvents[0].startDate)}${featuredEvents[0].timeLabel ? ` · ${featuredEvents[0].timeLabel}` : ""}`
                      : "Program updates posted per event"
                  }
                />
              </Reveal>

              <Reveal>
                <div className="rounded-[22px] border border-[var(--color-rule)] bg-[rgba(255,255,255,0.82)] p-6 shadow-[0_14px_34px_rgba(33,28,24,0.04)]">
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-sienna)] md:text-[10px]">
                    Calendar Snapshot
                  </div>
                  <div className="mt-5 space-y-4">
                    {featuredEvents.length === 0 ? (
                      <p className="text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">
                        No public events are scheduled right now. Check back here for openings, conversations, and
                        other Studio 201 gatherings.
                      </p>
                    ) : (
                      featuredEvents.map((event) => (
                        <Link
                          key={event.slug}
                          href={`/events/${event.slug}`}
                          className="grid gap-2 border-t border-[var(--color-rule)] pt-4 first:border-t-0 first:pt-0 md:grid-cols-[110px_minmax(0,1fr)]"
                        >
                          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-dust)] md:text-[10px]">
                            {formatMonthLabel(event.startDate)}
                            {event.startDate ? (
                              <>
                                <br />
                                {formatDayLabel(event.startDate)}
                              </>
                            ) : null}
                          </div>
                          <div>
                            <div className="font-display text-[24px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                              {event.title}
                            </div>
                            <p className="mt-2 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm md:leading-6">
                              {event.subtitle || event.venue || "Studio 201 program"}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[var(--color-parchment)] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <Reveal>
            <SectionLabel>Artists</SectionLabel>
          </Reveal>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
            <Reveal>
              <div className="overflow-hidden rounded-[28px] border border-[var(--color-rule)] bg-white/85 shadow-[0_18px_44px_rgba(33,28,24,0.06)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1fr)]">
                  <div className="min-h-[340px] bg-[linear-gradient(180deg,#8c6953_0%,#3f3836_100%)]">
                    {leadArtist?.profileImageUrl ? (
                      <img
                        src={leadArtist.profileImageUrl}
                        alt={leadArtist.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="relative h-full min-h-[340px] w-full bg-[radial-gradient(circle_at_60%_20%,rgba(243,217,186,0.52),transparent_22%),linear-gradient(180deg,#8c6953_0%,#3f3836_100%)]" />
                    )}
                  </div>
                  <div className="p-8">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-sienna)] md:text-[10px]">
                      Featured Artist
                    </div>
                    <h2 className="mt-4 font-display text-[clamp(38px,4vw,58px)] leading-[0.9] tracking-[-0.05em] text-[var(--color-near-black)]">
                      {leadArtist?.fullName || "Studio 201 Roster"}
                    </h2>
                    <p className="mt-5 max-w-[42ch] text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">
                      {leadArtist?.bio?.trim()
                        ? leadArtist.bio
                        : "Meet the artists connected to the current and recent Studio 201 program."}
                    </p>
                    <div className="mt-8">
                      <Link
                        href={leadArtist?.slug ? `/artists/${leadArtist.slug}` : "/artists"}
                        className="inline-flex items-center gap-2 text-[15px] tracking-[0.03em] text-[var(--color-sienna)] md:text-sm"
                      >
                        View artist page →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4">
              {(supportingArtists.length > 0 ? supportingArtists : artists.slice(0, 3)).map((artist, index) => (
                <Reveal key={artist.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="grid gap-5 rounded-[22px] border border-[var(--color-rule)] bg-[rgba(255,255,255,0.82)] p-4 shadow-[0_14px_34px_rgba(33,28,24,0.04)] sm:grid-cols-[110px_minmax(0,1fr)]"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#918376_0%,#ceb08c_38%,#5f5f5f_100%)]">
                      {artist.profileImageUrl ? (
                        <img src={artist.profileImageUrl} alt={artist.fullName} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-[28px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                        {artist.fullName}
                      </div>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-xs">Studio 201 artist</p>
                      <p className="mt-3 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm md:leading-6">
                        {artist.bio?.trim()
                          ? `${artist.bio.slice(0, 120)}${artist.bio.length > 120 ? "..." : ""}`
                        : "Meet the artists connected to Studio 201 through exhibitions and public projects."}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div>
            <Reveal>
              <SectionLabel>Archive</SectionLabel>
            </Reveal>
            <div className="mt-8 overflow-hidden rounded-[28px] border border-[var(--color-rule)] bg-white/80 shadow-[0_18px_44px_rgba(33,28,24,0.06)]">
              {featuredArchive.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="font-display text-[30px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                    Archive coming soon
                  </div>
                  <p className="mx-auto mt-3 max-w-lg text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">
                    Past exhibitions will appear here as the public archive continues to grow.
                  </p>
                </div>
              ) : (
                featuredArchive.map((item, index) => {
                  const year = item.endDate
                    ? new Date(item.endDate).getFullYear()
                    : item.startDate
                      ? new Date(item.startDate).getFullYear()
                      : "Archive";

                  return (
                    <Reveal key={item.id} delay={((index % 3) + 1) as 1 | 2 | 3}>
                      <Link
                        href={`/exhibitions/${item.slug}`}
                        className="grid gap-4 border-t border-[var(--color-rule)] px-6 py-6 first:border-t-0 md:grid-cols-[110px_minmax(0,1fr)_auto] md:items-center"
                      >
                        <div className="font-display text-[38px] leading-none tracking-[-0.05em] text-[var(--color-sienna)]">
                          {year}
                        </div>
                        <div>
                          <div className="font-display text-[30px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                            {item.title}
                          </div>
                          <p className="mt-2 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm md:leading-6">
                            {formatDateRange(item.startDate, item.endDate)}
                          </p>
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">
                          View show
                        </div>
                      </Link>
                    </Reveal>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <Reveal>
              <SectionLabel>Visit</SectionLabel>
            </Reveal>
            <Reveal>
              <div className="mt-8 overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(33,28,24,0.98),rgba(24,20,17,0.96))] p-8 text-[var(--color-cream)] shadow-[0_22px_52px_rgba(19,16,14,0.2)]">
                <h2 className="font-display text-[clamp(36px,4vw,54px)] leading-[0.9] tracking-[-0.05em]">
                  Plan your visit.
                </h2>
                <p className="mt-4 text-[15px] leading-7 text-[rgba(240,237,229,0.72)] md:text-sm">
                  Use the public site to see what is on view now, follow related events, and move through the wider
                  Studio 201 program before you arrive.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="border-t border-[rgba(255,255,255,0.12)] pt-5">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.56)] md:text-[10px]">
                      Location
                    </div>
                    <div className="mt-2 font-display text-[30px] leading-none tracking-[-0.04em]">Argao, Cebu</div>
                  </div>
                  <div className="border-t border-[rgba(255,255,255,0.12)] pt-5">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.56)] md:text-[10px]">
                      Program Flow
                    </div>
                    <p className="mt-2 text-[15px] leading-7 text-[rgba(240,237,229,0.74)] md:text-sm">
                      Follow exhibitions for what is currently on view, events for public gatherings, and the archive
                      for the gallery&apos;s longer memory.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/events"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(240,237,229,0.18)] px-5 text-[15px] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[rgba(240,237,229,0.08)] md:text-sm"
                  >
                    View Events
                  </Link>
                  <Link
                    href="/archive"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[rgba(240,237,229,0.18)] px-5 text-[15px] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[rgba(240,237,229,0.08)] md:text-sm"
                  >
                    Browse Archive
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
