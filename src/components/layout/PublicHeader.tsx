"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { useScroll } from "@/hooks/useScroll";
import { Menu, X } from "lucide-react";

export function PublicHeader() {
  const scrolled = useScroll(60);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHero = pathname === "/" || pathname.startsWith("/exhibitions");
  const keepTransparent = pathname === "/exhibitions";

  const navClass = clsx(
    "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-12 md:py-6 transition-all duration-400 ease-[cubic-bezier(0.25,0,0,1)]",
    {
      "bg-[rgba(245,242,236,0.96)] backdrop-blur-md border-b border-[var(--color-rule)]":
        scrolled && !keepTransparent,
      "bg-[rgba(23,22,15,0.3)] backdrop-blur-md border-b border-[rgba(240,237,229,0.1)]":
        scrolled && keepTransparent,
      "text-[var(--color-near-black)]":
        (scrolled && !keepTransparent) || (!isHero && !keepTransparent),
      "text-[var(--color-cream)]": (!scrolled && isHero) || keepTransparent,
    },
  );

  const linkClass = (isActive: boolean) =>
    clsx(
      "relative font-body text-[11px] font-normal tracking-[0.1em] uppercase transition-colors duration-400 ease-out cursor-pointer",
      {
        "text-[var(--color-warm-slate)] hover:text-[var(--color-near-black)]":
          (scrolled || !isHero) && !keepTransparent,
        "text-[rgba(240,237,229,0.8)] hover:text-[var(--color-cream)]":
          (!scrolled && isHero) || keepTransparent,
        "after:scale-x-100": isActive,
        "after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-[var(--color-sienna)] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]": true,
      },
    );

  const navLinks = [
    { href: "/exhibitions", label: "Exhibitions" },
    { href: "/artists", label: "Artists" },
    { href: "/events", label: "Events" },
    { href: "/archive", label: "Archive" },
  ];

  return (
    <>
      <nav className={navClass}>
        <Link href="/" className="font-display text-lg tracking-[-0.01em]">
          Studio 201
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-10 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={linkClass(pathname.startsWith(link.href))}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-1 border-none bg-transparent cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
        >
          <span
            className={clsx(
              "block w-6 h-[1px] transition-colors duration-300",
              (scrolled || !isHero || mobileOpen) && !keepTransparent
                ? "bg-[var(--color-near-black)]"
                : "bg-[var(--color-cream)]",
            )}
          />
          <span
            className={clsx(
              "block w-6 h-[1px] transition-colors duration-300",
              (scrolled || !isHero || mobileOpen) && !keepTransparent
                ? "bg-[var(--color-near-black)]"
                : "bg-[var(--color-cream)]",
            )}
          />
          <span
            className={clsx(
              "block w-6 h-[1px] transition-colors duration-300",
              (scrolled || !isHero || mobileOpen) && !keepTransparent
                ? "bg-[var(--color-near-black)]"
                : "bg-[var(--color-cream)]",
            )}
          />
        </button>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-[var(--color-charcoal)] z-[100] flex flex-col items-center justify-center gap-10 transition-opacity duration-400 ease-out",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <button
          className="absolute top-6 right-12 font-mono text-[11px] tracking-[0.1em] text-[var(--color-dust)] bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(false)}
        >
          CLOSE ×
        </button>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="font-display text-[clamp(32px,8vw,56px)] text-[var(--color-cream)] tracking-[-0.02em]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
  );
}
