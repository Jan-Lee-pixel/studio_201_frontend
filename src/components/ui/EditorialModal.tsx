"use client";

import { ReactNode, useEffect } from "react";

interface EditorialModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function EditorialModal({
  open,
  title,
  description,
  onClose,
  children,
}: EditorialModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] px-4 py-6 md:px-8 md:py-10" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(18,16,13,0.58)] backdrop-blur-[3px]"
        aria-label={`Close ${title}`}
        onClick={onClose}
      />
      <div className="relative mx-auto flex h-full w-full max-w-[1120px] items-start justify-center overflow-y-auto">
        <div className="w-full border border-[var(--color-rule)] bg-[var(--color-parchment)] shadow-[0_24px_80px_rgba(18,16,13,0.18)]">
          <div className="flex items-start justify-between gap-6 border-b border-[var(--color-rule)] px-6 py-5 md:px-8">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Edit item</div>
              <h2 className="mt-2 font-display text-[30px] leading-none text-[var(--color-near-black)]">{title}</h2>
              {description ? (
                <p className="mt-3 max-w-[56ch] text-sm leading-7 text-[var(--color-warm-slate)]">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-rule)] bg-white font-mono text-lg leading-none text-[var(--color-near-black)] transition-colors duration-300 hover:border-[var(--color-near-black)]"
              aria-label={`Close ${title}`}
            >
              ×
            </button>
          </div>
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
