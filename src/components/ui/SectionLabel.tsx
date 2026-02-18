import clsx from "clsx";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={clsx(
        "font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-sienna)] mb-12 flex items-center gap-4 before:content-[''] before:block before:w-8 before:h-[1px] before:bg-[var(--color-sienna)]",
        className
      )}
    >
      {children}
    </div>
  );
}
