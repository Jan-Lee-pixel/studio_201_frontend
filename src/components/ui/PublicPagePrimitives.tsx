import clsx from "clsx";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

type PublicSurfaceTone = "default" | "muted" | "charcoal";
type PublicActionTone = "dark" | "light" | "ghost" | "inverse";

export function PublicSurface({
  children,
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: PublicSurfaceTone;
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[24px] border md:rounded-[28px]",
        {
          "border-[var(--color-rule)] bg-[rgba(255,255,255,0.86)] shadow-[0_18px_42px_rgba(33,28,24,0.05)]":
            tone === "default",
          "border-[var(--color-rule)] bg-[rgba(250,248,244,0.76)] shadow-[0_16px_38px_rgba(33,28,24,0.04)]":
            tone === "muted",
          "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(33,28,24,0.98),rgba(24,20,17,0.96))] text-[var(--color-cream)] shadow-[0_22px_52px_rgba(19,16,14,0.2)]":
            tone === "charcoal",
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PublicActionLink({
  href,
  children,
  className,
  tone = "dark",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: PublicActionTone;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-[50px] items-center justify-center rounded-full px-5 text-[15px] tracking-[0.02em] transition-colors duration-200 md:min-h-[48px] md:px-5 md:text-sm md:tracking-[0.04em]",
        {
          "bg-[var(--color-near-black)] text-[var(--color-cream)] hover:bg-[var(--color-charcoal)]":
            tone === "dark",
          "border border-[var(--color-rule)] bg-white/80 text-[var(--color-near-black)] hover:bg-white":
            tone === "light",
          "border border-[var(--color-rule)] bg-[var(--color-bone)] text-[var(--color-near-black)] hover:bg-white":
            tone === "ghost",
          "border border-[rgba(240,237,229,0.18)] text-[var(--color-cream)] hover:bg-[rgba(240,237,229,0.08)]":
            tone === "inverse",
        },
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function PublicStatTile({
  label,
  value,
  note,
  inverse = false,
}: {
  label: ReactNode;
  value: ReactNode;
  note: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div
      className={clsx("rounded-[22px] border p-5", {
        "border-[var(--color-rule)] bg-[rgba(250,248,244,0.74)] shadow-[0_14px_34px_rgba(33,28,24,0.04)]":
          !inverse,
        "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)]": inverse,
      })}
    >
      <div
        className={clsx("font-mono text-[11px] uppercase tracking-[0.14em] md:text-[10px]", {
          "text-[var(--color-dust)]": !inverse,
          "text-[rgba(240,237,229,0.52)]": inverse,
        })}
      >
        {label}
      </div>
      <div
        className={clsx("mt-4 font-display text-[30px] leading-[0.9] tracking-[-0.05em]", {
          "text-[var(--color-near-black)]": !inverse,
          "text-[var(--color-cream)]": inverse,
        })}
      >
        {value}
      </div>
      <p
        className={clsx("mt-3 text-[15px] leading-7 md:text-[13px] md:leading-6", {
          "text-[var(--color-warm-slate)]": !inverse,
          "text-[rgba(240,237,229,0.68)]": inverse,
        })}
      >
        {note}
      </p>
    </div>
  );
}

export function PublicEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-[24px] border border-dashed border-[var(--color-rule)] bg-[rgba(255,255,255,0.72)] px-5 py-10 text-center md:rounded-[26px] md:px-6 md:py-12",
        className,
      )}
    >
      <div className="font-display text-[32px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
        {title}
      </div>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PublicSectionIntro({
  title,
  description,
  className,
}: {
  title: ReactNode;
  description: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("max-w-[480px]", className)}>
      <h2 className="font-display text-[clamp(34px,4vw,56px)] leading-[0.92] tracking-[-0.05em] text-[var(--color-near-black)]">
        {title}
      </h2>
      <p className="mt-5 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">{description}</p>
    </div>
  );
}

export function PublicPageHeader({
  section,
  title,
  description,
  stats,
  children,
  className,
}: {
  section: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  stats?: Array<{
    label: ReactNode;
    value: ReactNode;
  }>;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("px-6 pb-5 pt-24 md:px-12 md:pb-8 md:pt-32", className)}>
      <div className="mx-auto max-w-[1440px] border-b border-[var(--color-rule)] pb-5 md:pb-8">
        <SectionLabel className="mb-4">{section}</SectionLabel>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-[760px]">
            <h1 className="font-display text-[clamp(32px,8vw,62px)] leading-[0.92] tracking-[-0.05em] text-[var(--color-near-black)]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-[60ch] text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-[15px] md:leading-7">
                {description}
              </p>
            ) : null}
          </div>
          {stats?.length ? (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:text-right">
              {stats.map((stat, index) => (
                <div key={index}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">
                    {stat.label}
                  </dt>
                  <dd className="mt-1.5 text-[15px] leading-7 text-[var(--color-near-black)] md:text-sm md:leading-6">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {children ? <div className="mt-4 border-t border-[var(--color-rule)] pt-4 md:mt-5 md:pt-5">{children}</div> : null}
      </div>
    </section>
  );
}

export function PublicCatalogHeader({
  title,
  description,
  meta,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx("px-6 pb-5 pt-24 md:px-12 md:pb-6 md:pt-28", className)}>
      <div className="mx-auto max-w-[1440px] border-b border-[var(--color-rule)] pb-5 md:pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[560px]">
            <h1 className="font-display text-[clamp(28px,6vw,42px)] leading-[0.95] tracking-[-0.05em] text-[var(--color-near-black)]">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-[15px] md:leading-7">
                {description}
              </p>
            ) : null}
          </div>
          {meta ? (
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">{meta}</div>
          ) : null}
        </div>
        {children ? <div className="mt-4 md:mt-5">{children}</div> : null}
      </div>
    </section>
  );
}
