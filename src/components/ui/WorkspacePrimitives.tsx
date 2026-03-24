import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type WorkspaceCardTone = "default" | "muted" | "charcoal";
type WorkspaceStatusTone = "neutral" | "accent" | "success" | "warning" | "danger";

export function WorkspaceEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-sienna)]",
        "before:block before:h-px before:w-8 before:bg-current before:content-['']",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "mb-8 grid gap-6 border-b border-[var(--color-rule)] pb-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? <WorkspaceEyebrow>{eyebrow}</WorkspaceEyebrow> : null}
        <h1 className="mt-4 font-display text-[clamp(34px,5vw,60px)] font-normal leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--color-warm-slate)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 xl:justify-end">{actions}</div> : null}
    </div>
  );
}

export function WorkspaceCard({
  children,
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: WorkspaceCardTone;
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[24px] border",
        {
          "border-[rgba(26,24,20,0.1)] bg-white shadow-[0_16px_38px_rgba(33,28,24,0.05)]": tone === "default",
          "border-[var(--color-rule)] bg-[rgba(250,248,244,0.92)] shadow-[0_14px_34px_rgba(33,28,24,0.04)]":
            tone === "muted",
          "border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(33,28,24,0.98),rgba(24,20,17,0.96))] text-[var(--color-cream)] shadow-[0_20px_48px_rgba(19,16,14,0.22)]":
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

export function WorkspaceSectionTitle({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mb-6", className)}>
      {eyebrow ? <WorkspaceEyebrow>{eyebrow}</WorkspaceEyebrow> : null}
      <h2 className="mt-3 font-display text-[clamp(26px,3vw,40px)] font-normal leading-[0.96] tracking-[-0.04em] text-[var(--color-near-black)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-warm-slate)]">{description}</p>
      ) : null}
    </div>
  );
}

export function WorkspaceMetric({
  label,
  value,
  note,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("rounded-[18px] border border-[var(--color-rule)] bg-[rgba(250,248,244,0.8)] p-4", className)}>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">{label}</div>
      <div className="mt-3 font-display text-[30px] leading-none tracking-[-0.05em] text-[var(--color-near-black)]">
        {value}
      </div>
      {note ? <div className="mt-2 text-xs leading-5 text-[var(--color-warm-slate)]">{note}</div> : null}
    </div>
  );
}

export function WorkspaceField({
  label,
  hint,
  optional,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  optional?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("space-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-[var(--color-near-black)]">{label}</label>
        {optional ? (
          <span className="rounded-full bg-[var(--color-bone)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)]">
            {optional}
          </span>
        ) : null}
      </div>
      {hint ? <p className="text-xs leading-5 text-[var(--color-dust)]">{hint}</p> : null}
      {children}
    </div>
  );
}

export function WorkspaceStatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: WorkspaceStatusTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        "before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
        {
          "bg-[var(--color-bone)] text-[var(--color-warm-slate)] before:bg-[var(--color-dust)]":
            tone === "neutral",
          "bg-[rgba(168,92,64,0.12)] text-[var(--color-sienna)] before:bg-[var(--color-sienna)]":
            tone === "accent",
          "bg-[rgba(122,158,126,0.16)] text-[#496e4d] before:bg-[#5c8961]": tone === "success",
          "bg-[rgba(196,136,74,0.14)] text-[#9d6d1d] before:bg-[#c4884a]": tone === "warning",
          "bg-[rgba(181,96,58,0.12)] text-[#9f4c2d] before:bg-[#b5603a]": tone === "danger",
        },
        className,
      )}
    >
      {children}
    </span>
  );
}

export function WorkspaceEmptyState({
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
        "rounded-[24px] border border-dashed border-[var(--color-rule)] bg-[rgba(250,248,244,0.78)] px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className="font-display text-[28px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--color-warm-slate)]">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
