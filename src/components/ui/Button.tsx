import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "outline-light";
}

export function Button({ className, variant = "outline", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-block font-body text-xs font-normal tracking-[0.08em] uppercase px-7 py-3 border bg-transparent cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.25,0,0,1)] rounded-none",
        {
          "border-[var(--color-near-black)] text-[var(--color-near-black)] hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]": variant === "outline",
          "border-[rgba(240,237,229,0.6)] text-[var(--color-cream)] hover:bg-[var(--color-cream)] hover:text-[var(--color-near-black)]": variant === "outline-light",
        },
        className
      )}
      {...props}
    />
  );
}
