import Link from "next/link";

const programLinks = [
  { href: "/exhibitions", label: "Exhibitions" },
  { href: "/artists", label: "Artists" },
  { href: "/events", label: "Events" },
  { href: "/archive", label: "Archive" },
];

const collectLinks = [
  { href: "/merch", label: "Shop" },
  { href: "/backroom", label: "Backroom" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-14 md:px-12 md:py-18">
      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="max-w-xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-sienna)]">
            Studio 201
          </div>
          <h2 className="mt-4 font-display text-[clamp(34px,4vw,54px)] font-normal leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
            A calmer way to follow the gallery online.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-warm-slate)]">
            Start with what is on view now, then move through artists, events, collecting, and the archive without
            unnecessary detours.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Program
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {programLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-body text-sm text-[var(--color-near-black)] transition-colors duration-200 hover:text-[var(--color-sienna)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Collect
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {collectLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-body text-sm text-[var(--color-near-black)] transition-colors duration-200 hover:text-[var(--color-sienna)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
              Visit
            </div>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--color-warm-slate)]">
              <p>
                Cebu, Philippines
                <br />
                Studio 201&apos;s public program moves with the exhibition calendar.
              </p>
              <p>
                Visit details, inquiries, and seasonal updates are added as each public program is announced.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-rule)] pt-6 text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)] md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Studio 201. All rights reserved.</span>
        <span>Exhibition-first online program</span>
      </div>
    </footer>
  );
}
