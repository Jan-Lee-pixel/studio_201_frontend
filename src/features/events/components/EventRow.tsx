import Link from "next/link";
import clsx from "clsx";
import { Reveal } from "@/components/animation/Reveal";

interface EventRowProps {
  date: string;
  day: string;
  type: string;
  title: string;
  subtitle: string;
  venue: string;
  time: string;
  isExternal?: boolean;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function EventRow({ date, day, type, title, subtitle, venue, time, isExternal, delay = 0 }: EventRowProps) {
  return (
    <Reveal delay={delay}>
      <Link
        href="/events" // Todo: specific event link
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

        <div className="font-body text-xs text-[var(--color-dust)] text-left md:text-right tracking-[0.03em]">
          {venue}
          <br />
          {time}
        </div>
      </Link>
    </Reveal>
  );
}
