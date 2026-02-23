"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Reveal } from "@/components/animation/Reveal";

interface EventRowProps {
  slug?: string;
  date: string;
  day: string;
  type: string;
  title: string;
  subtitle: string;
  venue: string;
  time: string;
  isExternal?: boolean;
  hasDocumentation?: boolean;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}


export function EventRow({ slug, date, day, type, title, subtitle, venue, time, isExternal, hasDocumentation, delay = 0 }: EventRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(slug ? `/events/${slug}` : "/events");
  };

  return (
    <Reveal delay={delay}>
      <div
        onClick={handleRowClick}
        className={clsx(
          "grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3 md:gap-10 py-8 border-t border-[var(--color-rule)] hover:bg-[rgba(240,237,229,0.2)] transition-colors duration-200 cursor-pointer group last:border-b",
          { "pl-8": isExternal }
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[13px] text-[var(--color-near-black)]">{date}</div>
          <div className="font-mono text-[10px] text-[var(--color-dust)] tracking-[0.06em]">{day}</div>
        </div>

        <div>
          <div
            className={clsx(
              "font-mono text-[9px] tracking-[0.12em] uppercase mb-2.5",
              isExternal ? "text-[var(--color-dust)]" : "text-[var(--color-sienna)]"
            )}
          >
            {type}
          </div>
          <div
            className={clsx(
              "font-display text-[22px] font-normal tracking-[-0.01em] mb-1.5 transition-colors duration-200 group-hover:text-[var(--color-sienna)]",
              isExternal ? "font-body text-lg font-medium text-[var(--color-warm-slate)]" : "text-[var(--color-near-black)]"
            )}
          >
            {title}
          </div>
          <div className="font-sub italic text-[15px] text-[var(--color-warm-slate)]">{subtitle}</div>
        </div>

        <div className="font-body text-xs text-[var(--color-dust)] text-left md:text-right tracking-[0.03em] flex flex-col md:items-end justify-between">
          <div>
            {venue}
            <br />
            {time}
          </div>
          {hasDocumentation && slug && (
            <Link
              href={`/events/${slug}/documentation`}
              onClick={(e) => e.stopPropagation()} // Prevent triggering the row link
              className="mt-4 md:mt-0 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-near-black)] bg-[var(--color-bone)] border border-[var(--color-rule)] px-3 py-1.5 hover:bg-[var(--color-sienna)] hover:text-[var(--color-cream)] hover:border-[var(--color-sienna)] transition-colors duration-300"
            >
              View Documentation →
            </Link>
          )}
        </div>
      </div>
    </Reveal>
  );
}
