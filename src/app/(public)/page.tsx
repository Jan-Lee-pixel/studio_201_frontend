import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ExhibitionCard } from "@/features/exhibitions/components/ExhibitionCard";
import { ArtistCard } from "@/features/artists/components/ArtistCard";
import { EventRow } from "@/features/events/components/EventRow";
import { ArchiveItem } from "@/features/exhibitions/components/ArchiveItem";
import { Reveal } from "@/components/animation/Reveal";

export default function Home() {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=1800&q=80"
          alt="Mga Paa sa Alapaap — Maria Santos"
          className="absolute inset-0 w-full h-full object-cover animate-hero-reveal origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,22,15,0.82)] via-[rgba(23,22,15,0.1)_55%] to-transparent" />
        
        <div className="absolute bottom-18 left-6 right-6 md:left-12 md:right-12 max-w-[680px]">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--color-sienna)] mb-5 opacity-0 translate-y-3 animate-slide-up [animation-delay:200ms]">
            Now on View
          </div>
          <h1 className="font-display text-[clamp(48px,7vw,88px)] font-normal leading-[1.05] tracking-[-0.02em] text-[var(--color-cream)] mb-4 opacity-0 translate-y-3 animate-slide-up [animation-delay:320ms]">
            Mga Paa<br />sa Alapaap
          </h1>
          <div className="font-sub text-xl italic font-light text-[var(--color-dust)] mb-2 opacity-0 translate-y-3 animate-slide-up [animation-delay:400ms]">
            Maria Santos
          </div>
          <div className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.06em] mb-9 opacity-0 translate-y-3 animate-slide-up [animation-delay:460ms]">
            Oct 3 – Nov 28, 2025
          </div>
          <div className="opacity-0 translate-y-3 animate-slide-up [animation-delay:540ms]">
            <Link href="/exhibitions/mga-paa-sa-alapaap" className="relative inline-block font-body font-medium text-sm tracking-[0.02em] text-[var(--color-cream)] after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100">
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
          <ExhibitionCard
            slug="lupa-at-langit"
            image="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"
            title="Lupa at Langit"
            artist="Jun Manlangit"
            date="Opening Nov 30, 2025"
            delay={1}
          />
          <ExhibitionCard
            slug="ulan-sa-disyembre"
            image="https://images.unsplash.com/photo-1620510625142-b45cbb784397?w=800&q=80"
            title="Ulan sa Disyembre"
            artist="Elena Yap"
            date="Opening Jan 15, 2026"
            delay={2}
          />
          <ExhibitionCard
            slug="dagat-ng-alaala"
            image="https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80"
            title="Dagat ng Alaala"
            artist="Carlo Reyes"
            date="Opening Mar 5, 2026"
            delay={3}
          />
        </div>
      </section>

      {/* FEATURED ARTISTS */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-linen)]">
        <Reveal><SectionLabel>Artists</SectionLabel></Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-16">
          <ArtistCard
            slug="maria-santos"
            image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"
            name="Maria Santos"
            medium="Painting, Mixed Media"
            delay={1}
          />
          <ArtistCard
            slug="jun-manlangit"
            image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80"
            name="Jun Manlangit"
            medium="Sculpture, Installation"
            delay={2}
          />
          <ArtistCard
            slug="elena-yap"
            image="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80"
            name="Elena Yap"
            medium="Photography, Video"
            delay={3}
          />
          <ArtistCard
            slug="carlo-reyes"
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
            name="Carlo Reyes"
            medium="Drawing, Printmaking"
            delay={4}
          />
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-parchment)]">
        <Reveal><SectionLabel>Events</SectionLabel></Reveal>
        <div className="mt-16">
          <EventRow
            date="Nov 5, 2025" day="Wednesday" type="Artist Talk"
            title="Painting as Memory" subtitle="A Conversation with Maria Santos"
            venue="Studio 201" time="7:00 PM"
          />
          <EventRow
            date="Nov 12, 2025" day="Wednesday" type="Opening Night"
            title="Mga Paa sa Alapaap" subtitle="Maria Santos"
            venue="Studio 201" time="6:00 PM" delay={1}
          />
          <EventRow
            date="Dec 2, 2025" day="Tuesday" type="Workshop [External]"
            title="Relief Printmaking" subtitle="with Jun Manlangit"
            venue="Sugbo Mercado" time="2:00 PM" isExternal delay={2}
          />
          <EventRow
            date="Dec 15, 2025" day="Monday" type="Symposium"
            title="Contemporary Art in the Visayas" subtitle="Panel Discussion"
            venue="Studio 201" time="10:00 AM" delay={3}
          />
        </div>
        <div className="mt-12">
           <Reveal><Link href="/events" className="relative inline-block font-body font-medium text-sm tracking-[0.02em] transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100">View all events →</Link></Reveal>
        </div>
      </section>

      {/* ARCHIVE PREVIEW */}
      <section className="py-20 md:py-30 px-6 md:px-12 bg-[var(--color-linen)]">
        <Reveal><SectionLabel>Selected Archive</SectionLabel></Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
          <ArchiveItem
            slug="halina-at-luha"
            image="https://images.unsplash.com/photo-1590907047706-ee9c08cf3189?w=800&q=80"
            title="Halina at Luha"
            meta="Maria Santos — 2024"
            delay={1}
          />
          <ArchiveItem
            slug="tahanan"
            image="https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80"
            title="Tahanan"
            meta="Group Exhibition — 2024"
            delay={2}
          />
          <ArchiveItem
            slug="sa-pamamagitan-ng-kahoy"
            image="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80"
            title="Sa Pamamagitan ng Kahoy"
            meta="Jun Manlangit — 2023"
            delay={3}
          />
        </div>
        <div className="mt-12">
          <Reveal><Link href="/archive" className="relative inline-block font-body font-medium text-sm tracking-[0.02em] transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-current after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100">View full archive →</Link></Reveal>
        </div>
      </section>
    </div>
  );
}
