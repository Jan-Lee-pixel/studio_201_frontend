import type { Metadata } from "next";
import { Reveal } from "@/components/animation/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  PublicActionLink,
  PublicSurface,
} from "@/components/ui/PublicPagePrimitives";

export const metadata: Metadata = {
  title: "Spaces | Studio 201",
  description: "The gallery extends beyond the walls through coffee, residencies, and temporary programs.",
};

export default function SpacesPage() {
  return (
    <div className="bg-[linear-gradient(180deg,#17160f_0%,#1a1814_32%,var(--color-parchment)_32%,var(--color-bone)_100%)]">
      <section className="px-6 pb-20 pt-32 md:px-12 md:pb-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 xl:grid-cols-[minmax(0,0.88fr)_minmax(360px,1.12fr)]">
          <Reveal className="flex flex-col justify-between gap-10 text-[var(--color-cream)]">
            <div>
              <SectionLabel className="text-[var(--color-ochre)] before:bg-[var(--color-ochre)]">
                Spaces
              </SectionLabel>
              <h1 className="mt-6 max-w-[11ch] font-display text-[clamp(56px,7vw,104px)] leading-[0.84] tracking-[-0.06em] text-[var(--color-cream)]">
                Spaces around the gallery.
              </h1>
              <p className="mt-6 max-w-[56ch] text-[15px] leading-8 text-[rgba(240,237,229,0.72)]">
                This page will hold coffee-room, residency, and project-space updates when they are ready to be published.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <PublicActionLink href="/events" tone="inverse">
                  View events
                </PublicActionLink>
                <PublicActionLink href="/exhibitions" tone="inverse">
                  Current program
                </PublicActionLink>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-[rgba(255,255,255,0.12)] pt-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.52)]">Status</div>
                <div className="mt-2 text-sm text-[var(--color-cream)]">Updates published seasonally</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.52)]">Now</div>
                <div className="mt-2 text-sm text-[var(--color-cream)]">See exhibitions and events for current activity</div>
              </div>
            </div>
          </Reveal>

          <Reveal className="xl:pt-6">
            <PublicSurface tone="charcoal" className="overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[minmax(280px,0.88fr)_minmax(0,1.12fr)]">
                <div className="min-h-[360px] bg-[radial-gradient(circle_at_22%_16%,rgba(243,217,186,0.22),transparent_28%),linear-gradient(180deg,#5a4030_0%,#3b2c20_100%)]" />
                <div className="p-8 md:p-10">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.56)]">Studio 201</div>
                  <h2 className="mt-5 font-display text-[clamp(38px,4vw,58px)] leading-[0.9] tracking-[-0.05em] text-[var(--color-cream)]">
                    When a space update is ready, it should read like a real public notice.
                  </h2>
                  <p className="mt-6 max-w-[44ch] text-sm leading-7 text-[rgba(240,237,229,0.72)]">
                    Until then, this page should stay honest and lightweight instead of pretending there is a fuller program than what has actually been published.
                  </p>

                  <div className="mt-8 grid gap-4 border-t border-[rgba(255,255,255,0.08)] pt-6 sm:grid-cols-2">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.52)]">Current focus</div>
                      <p className="mt-2 text-sm leading-7 text-[var(--color-cream)]">Exhibitions and public events</p>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.52)]">Updates</div>
                      <p className="mt-2 text-sm leading-7 text-[rgba(240,237,229,0.72)]">
                        New space-related notes will appear here once they are part of the public program.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PublicSurface>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-[var(--color-rule)] bg-[rgba(250,248,244,0.72)] px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <Reveal>
              <div>
                <SectionLabel>Pop-ups & Residencies</SectionLabel>
                <div className="mt-6 max-w-[460px]">
                  <h2 className="font-display text-[clamp(32px,4vw,48px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-near-black)]">
                    Short-term programs and working rooms.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-warm-slate)]">
                    Follow temporary occupations, studio residencies, and related activity around the gallery.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-6">
              <Reveal>
                <PublicSurface>
                  <div className="p-8 md:p-10">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">Publishing note</div>
                    <h2 className="mt-5 font-display text-[clamp(32px,4vw,50px)] leading-[0.92] tracking-[-0.05em] text-[var(--color-near-black)]">
                      Space updates will appear when they are confirmed.
                    </h2>
                    <p className="mt-4 max-w-[48ch] text-sm leading-7 text-[var(--color-warm-slate)]">
                      That may include residency notes, coffee-room announcements, pop-ups, or temporary occupations around the gallery.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <PublicActionLink href="/exhibitions" tone="dark">
                        Current exhibitions
                      </PublicActionLink>
                      <PublicActionLink href="/events" tone="ghost">
                        Public events
                      </PublicActionLink>
                    </div>
                  </div>
                </PublicSurface>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
