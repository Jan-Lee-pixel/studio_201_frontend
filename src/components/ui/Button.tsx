import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "outline-light";
}

export function Button({ className, variant = "outline", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-[48px] items-center justify-center rounded-full border px-6 text-[11px] font-mono font-normal tracking-[0.14em] uppercase bg-transparent cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.25,0,0,1)]",
        {
          "border-[var(--color-near-black)] text-[var(--color-near-black)] hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]": variant === "outline",
          "border-[rgba(240,237,229,0.16)] text-[var(--color-cream)] hover:bg-[rgba(240,237,229,0.08)]": variant === "outline-light",
        },
        className
      )}
      {...props}
    />
  );
}
