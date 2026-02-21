"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Exhibition {
  slug: string;
  image: string;
  title: string;
  artist: string;
  date: string;
}

interface ExhibitionsCarouselProps {
  exhibitions: Exhibition[];
}

export function ExhibitionsCarousel({ exhibitions }: ExhibitionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? exhibitions.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === exhibitions.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const getPreviousIndex = () =>
    currentIndex === 0 ? exhibitions.length - 1 : currentIndex - 1;

  const getNextIndex = () =>
    currentIndex === exhibitions.length - 1 ? 0 : currentIndex + 1;

  const current = exhibitions[currentIndex];
  const previous = exhibitions[getPreviousIndex()];
  const next = exhibitions[getNextIndex()];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-charcoal)]">
      <div className="relative h-full flex items-center justify-center">
        {/* Previous Peek */}
        <div className="absolute left-0 w-[15%] h-[70%] opacity-30 overflow-hidden">
          <img
            key={`prev-${getPreviousIndex()}`}
            src={previous.image}
            alt={previous.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Current Exhibition */}
        <div className="relative w-[60%] h-[80%] group">
          <Link href={`/exhibitions/${current.slug}`}>
            <div className="relative w-full h-full">
              <img
                key={currentIndex}
                src={current.image}
                alt={current.title}
                className="absolute inset-0 w-full h-full object-cover animate-[fadeIn_800ms_ease-out]"
              />
            </div>

            {/* Text Overlay - Bottom */}
            <div
              key={`text-${currentIndex}`}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgba(23,22,15,0.95)] to-transparent p-8 md:p-12 animate-[slideUp_600ms_200ms_ease-out_backwards]"
            >
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--color-sienna)] mb-3">
                {current.date}
              </div>
              <h2 className="font-display text-[clamp(32px,5vw,56px)] font-normal tracking-[-0.02em] leading-[1.1] text-[var(--color-cream)] mb-2">
                {current.title}
              </h2>
              <div className="font-sub italic text-lg text-[var(--color-dust)]">
                {current.artist}
              </div>
            </div>
          </Link>
        </div>

        {/* Next Peek */}
        <div className="absolute right-0 w-[15%] h-[70%] opacity-30 overflow-hidden">
          <img
            key={`next-${getNextIndex()}`}
            src={next.image}
            alt={next.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          disabled={isTransitioning}
          className="absolute left-[5%] z-10 w-12 h-12 flex items-center justify-center border border-[var(--color-cream)] text-[var(--color-cream)] hover:bg-[var(--color-cream)] hover:text-[var(--color-near-black)] transition-all duration-300 disabled:opacity-50"
          aria-label="Previous exhibition"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={goToNext}
          disabled={isTransitioning}
          className="absolute right-[5%] z-10 w-12 h-12 flex items-center justify-center border border-[var(--color-cream)] text-[var(--color-cream)] hover:bg-[var(--color-cream)] hover:text-[var(--color-near-black)] transition-all duration-300 disabled:opacity-50"
          aria-label="Next exhibition"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
