"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Reveal } from "@/components/animation/Reveal";

interface EventRowProps {
  slug?: string;
  hrefPrefix?: string;
  href?: string;
  date: string;
  day: string;
  type: string;
  title: string;
  subtitle: string;
  venue: string;
  time: string;
  isExternal?: boolean;
  isPast?: boolean;
  hasDocumentation?: boolean;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}


export function EventRow({
  slug,
  hrefPrefix,
  href,
  date,
  day,
  type,
  title,
  subtitle,
  venue,
  time,
  isExternal,
  isPast,
  hasDocumentation,
  delay = 0,
}: EventRowProps) {
  const router = useRouter();
  const destination = href || (slug ? `${hrefPrefix ?? "/events"}/${slug}` : hrefPrefix ?? "/events");

  const handleRowClick = () => {
    router.push(destination);
  };

  return (
    <Reveal delay={delay}>
      <article
        onClick={handleRowClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleRowClick();
          }
        }}
        tabIndex={0}
        role="link"
        className={clsx(
          "grid grid-cols-1 gap-4 border-t border-[var(--color-rule)] py-5 transition-colors duration-200 cursor-pointer group outline-none first:border-t-0 hover:bg-[rgba(240,237,229,0.18)] focus-visible:bg-[rgba(240,237,229,0.18)] md:grid-cols-[132px_minmax(0,1fr)_132px] md:gap-6",
          { "md:pl-6": isExternal }
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[13px] text-[var(--color-near-black)]">{date}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)]">{day}</div>
        </div>

        <div>
          <div
            className={clsx(
              "mb-2.5 font-mono text-[10px] tracking-[0.14em] uppercase",
              isExternal ? "text-[var(--color-dust)]" : "text-[var(--color-sienna)]"
            )}
          >
            {type}
            {isPast ? " · Archive" : ""}
          </div>
          <div
            className={clsx(
              "mb-2 font-display text-[clamp(22px,2.2vw,30px)] font-normal leading-[1] tracking-[-0.03em] transition-colors duration-200 group-hover:text-[var(--color-sienna)]",
              isExternal ? "text-[var(--color-warm-slate)]" : "text-[var(--color-near-black)]"
            )}
          >
            {title}
          </div>
          {subtitle ? (
            <div className="max-w-[52ch] text-[15px] leading-7 text-[var(--color-warm-slate)]">{subtitle}</div>
          ) : null}
        </div>

        <div className="flex flex-col justify-between gap-4 text-left md:items-end md:text-right">
          <div>
            <div className="text-xs tracking-[0.03em] text-[var(--color-dust)]">{venue}</div>
            {time ? <div className="mt-1 text-xs tracking-[0.03em] text-[var(--color-dust)]">{time}</div> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            {hasDocumentation && slug ? (
              <Link
                href={`/events/${slug}/documentation`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex min-h-[32px] items-center rounded-full border border-[var(--color-rule)] bg-[var(--color-bone)] px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:border-[var(--color-near-black)] hover:bg-white"
              >
                Documentation
              </Link>
            ) : null}
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
              View details
            </span>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
