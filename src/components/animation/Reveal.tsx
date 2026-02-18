"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5; // Corresponds to template's d1-d5
  threshold?: number;
}

export function Reveal({ children, className, delay = 0, threshold = 0.12 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={clsx(
        "reveal",
        revealed && "revealed",
        delay > 0 && `reveal-d${delay}`,
        className
      )}
    >
      {children}
    </div>
  );
}
