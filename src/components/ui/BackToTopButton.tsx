"use client";

import clsx from "clsx";
import { ChevronUp } from "lucide-react";
import { useScroll } from "@/hooks/useScroll";

export function BackToTopButton() {
  const visible = useScroll(520);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className={clsx(
        "fixed bottom-5 right-5 z-40 inline-flex min-h-[52px] items-center gap-2 rounded-full border border-[var(--color-rule)] bg-[rgba(255,255,255,0.94)] px-4 text-[var(--color-near-black)] shadow-[0_16px_40px_rgba(37,31,24,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-near-black)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sienna)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-parchment)] md:bottom-8 md:right-8 md:min-h-[48px]",
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ChevronUp className="h-4 w-4" strokeWidth={1.8} />
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] md:text-[10px]">Top</span>
    </button>
  );
}
