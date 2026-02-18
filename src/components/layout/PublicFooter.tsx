import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-[var(--color-near-black)] px-6 py-16 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
      <div className="flex flex-col gap-2">
        <div className="font-display text-2xl text-[var(--color-cream)]">Studio 201</div>
        <div className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.08em]">Cebu, Philippines</div>
      </div>

      <div className="flex flex-col md:items-end gap-6">
        <div className="flex gap-8">
          {["Exhibitions", "Artists", "Events", "Archive"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="font-body text-xs tracking-[0.06em] uppercase text-[var(--color-dust)] hover:text-[var(--color-cream)] transition-colors duration-200"
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="flex gap-6">
          <a href="#" className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.08em] hover:text-[var(--color-sienna)] transition-colors duration-200">Instagram</a>
          <a href="#" className="font-mono text-[11px] text-[var(--color-dust)] tracking-[0.08em] hover:text-[var(--color-sienna)] transition-colors duration-200">Email</a>
        </div>
      </div>

      <div className="col-span-1 md:col-span-2 pt-6 mt-6 border-t border-[#2A2920] w-full text-right font-mono text-[10px] text-[#3A3830] tracking-[0.06em]">
        © {new Date().getFullYear()} Studio 201. All rights reserved.
      </div>
    </footer>
  );
}
