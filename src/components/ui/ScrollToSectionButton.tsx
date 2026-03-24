"use client";

interface ScrollToSectionButtonProps {
  targetId: string;
  offset?: number;
  className?: string;
  children: React.ReactNode;
}

export function ScrollToSectionButton({
  targetId,
  offset = 112,
  className,
  children,
}: ScrollToSectionButtonProps) {
  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0);
    const baseUrl = `${window.location.pathname}${window.location.search}`;
    const nextUrl = `${baseUrl}#${targetId}`;

    if (window.location.hash === `#${targetId}`) {
      window.history.replaceState(null, "", baseUrl);
    }

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    window.history.replaceState(null, "", nextUrl);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-controls={targetId}
    >
      {children}
    </button>
  );
}
