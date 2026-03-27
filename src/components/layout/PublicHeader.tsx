"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useScroll } from "@/hooks/useScroll";
import { LogoMark } from "@/components/ui/LogoMark";
import { createClient } from "@/lib/supabase/client";

export function PublicHeader() {
  const scrolled = useScroll(60);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [supabase] = useState(() => createClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasDarkHero = pathname === "/" || pathname === "/spaces";
  const isHero = hasDarkHero;
  const keepTransparent = pathname === "/spaces";
  const showLogin = !loading && !isAuthenticated && pathname !== "/login";
  const showLogout = !loading && isAuthenticated;

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setIsAuthenticated(Boolean(session?.user));
      setLoading(false);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(session?.user));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navClass = clsx(
    "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 md:px-12 md:py-6 transition-all duration-400 ease-[cubic-bezier(0.25,0,0,1)]",
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

  const actionButtonClass = clsx(
    "inline-flex min-h-[40px] items-center justify-center rounded-full px-4 border text-[10px] font-mono uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer",
    (scrolled || !isHero) && !keepTransparent
      ? "border-[var(--color-rule)] bg-[rgba(255,255,255,0.8)] text-[var(--color-near-black)] hover:border-[var(--color-near-black)] hover:bg-white"
      : "border-[rgba(240,237,229,0.16)] text-[var(--color-cream)] hover:bg-[rgba(240,237,229,0.08)]",
  );

  const mobileActionClass =
    "inline-flex min-h-[46px] items-center justify-center rounded-full px-5 border border-[rgba(240,237,229,0.16)] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-cream)] transition-colors duration-300 hover:bg-[rgba(240,237,229,0.08)]";

  const navLinks = [
    { href: "/exhibitions", label: "Exhibitions", active: pathname === "/exhibitions" || pathname.startsWith("/exhibitions/") },
    { href: "/artists", label: "Artists", active: pathname === "/artists" || pathname.startsWith("/artists/") },
    { href: "/events", label: "Events", active: pathname === "/events" || pathname.startsWith("/events/") },
    {
      href: "/merch",
      label: "Merch",
      active: pathname === "/merch" || pathname.startsWith("/merch/"),
    },
    {
      href: "/backroom",
      label: "Backroom",
      active: pathname === "/backroom" || pathname.startsWith("/backroom/"),
    },
  ];

  const handleSignOut = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);
      setMobileOpen(false);
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to sign out from public header", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <nav className={navClass}>
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="h-6 md:h-7 w-auto" />
          <span className="font-display text-base tracking-[-0.01em] md:text-lg">Studio 201</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden list-none gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={linkClass(link.active)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {showLogin ? (
            <Link href="/login" className={clsx("hidden md:inline-flex", actionButtonClass)}>
              Log in
            </Link>
          ) : null}

          {showLogout ? (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className={clsx("hidden md:inline-flex", actionButtonClass)}
              disabled={signingOut}
              aria-busy={signingOut}
            >
              {signingOut ? "Signing Out" : "Log Out"}
            </button>
          ) : null}

          {/* Mobile Toggle */}
          <button
            className="md:hidden flex min-h-[40px] min-w-[40px] flex-col items-center justify-center gap-[5px] rounded-full border border-transparent bg-transparent p-1 cursor-pointer"
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
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-[100] overflow-y-auto bg-[rgba(23,22,15,0.98)] px-5 py-20 transition-opacity duration-400 ease-out md:px-12 md:py-24",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <button
          className="absolute right-5 top-5 font-mono text-[11px] tracking-[0.1em] text-[var(--color-dust)] bg-transparent border-none cursor-pointer md:right-12 md:top-6"
          onClick={() => setMobileOpen(false)}
        >
          CLOSE ×
        </button>
        <div className="mx-auto flex w-full max-w-[420px] flex-col items-stretch justify-center">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="mb-6 flex items-center gap-3 text-[var(--color-cream)]"
          >
            <LogoMark className="h-6 w-auto" />
            <span className="font-display text-xl tracking-[-0.02em]">Studio 201</span>
          </Link>

          <div className="w-full space-y-2 border-y border-[rgba(240,237,229,0.1)] py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[60px] items-center justify-between rounded-[18px] border border-[rgba(240,237,229,0.08)] bg-[rgba(255,255,255,0.02)] px-4 text-[var(--color-cream)]"
              >
                <span className="font-display text-[clamp(26px,8vw,40px)] leading-none tracking-[-0.03em]">
                  {link.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.42)]">
                  View
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.56)]">
            <Link href="/archive" onClick={() => setMobileOpen(false)}>
              Archive
            </Link>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {showLogin ? (
              <Link href="/login" onClick={() => setMobileOpen(false)} className={mobileActionClass}>
                Portal
              </Link>
            ) : null}
            {showLogout ? (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className={mobileActionClass}
                disabled={signingOut}
                aria-busy={signingOut}
              >
                {signingOut ? "Signing Out" : "Log Out"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
