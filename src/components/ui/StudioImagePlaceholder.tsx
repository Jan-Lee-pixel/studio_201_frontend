import clsx from "clsx";
import { LogoMark } from "@/components/ui/LogoMark";

type StudioImagePlaceholderProps = {
  className?: string;
  markClassName?: string;
  label?: string;
  labelClassName?: string;
};

export function StudioImagePlaceholder({
  className,
  markClassName,
  label,
  labelClassName,
}: StudioImagePlaceholderProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center overflow-hidden bg-[linear-gradient(160deg,var(--color-cream),var(--color-linen))] text-[var(--color-sienna)]",
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,92,64,0.16),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(23,22,15,0.06))]" />
      <div className="relative z-[1] flex flex-col items-center justify-center gap-2 px-3 text-center">
        <LogoMark className={clsx("w-16 h-auto", markClassName)} />
        {label ? (
          <span
            className={clsx(
              "font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-dust)]",
              labelClassName
            )}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
