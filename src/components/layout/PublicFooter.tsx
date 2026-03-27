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
    <footer className="border-t border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-10 md:px-12 md:py-12">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="max-w-md">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-sienna)]">
            Studio 201
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-warm-slate)] md:leading-7">
            Follow the current program, browse the roster, and move through collecting without unnecessary detours.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
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
            <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--color-warm-slate)] md:leading-7">
              <p>Cebu, Philippines</p>
              <p>Visit details and seasonal updates are added as each program is announced.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-rule)] pt-5 text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)] md:mt-10 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Studio 201. All rights reserved.</span>
        <span>Exhibition-first online program</span>
      </div>
    </footer>
  );
}
