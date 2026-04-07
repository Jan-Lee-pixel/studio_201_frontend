import clsx from "clsx";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={clsx(
        "mb-10 flex items-center gap-4 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-sienna)] before:block before:h-[1px] before:w-8 before:bg-[var(--color-sienna)] before:content-[''] md:mb-12 md:text-[12px]",
        className
      )}
    >
      {children}
    </div>
  );
}
