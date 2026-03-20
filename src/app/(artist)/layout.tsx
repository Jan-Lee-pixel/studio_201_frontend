"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import "../../styles/dashboard.css";
import { DashboardShellSkeleton } from "@/components/ui/SkeletonPage";
import { LogoMark } from "@/components/ui/LogoMark";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const normalizedRole = profile?.role?.toLowerCase();
  const normalizedStatus = profile?.accountStatus?.toLowerCase();
  const isArtworksRoute = pathname.startsWith("/artist/artworks") || pathname === "/artworks";

  const breadcrumbLabel = useMemo(() => {
    if (pathname === "/artist/profile") return "Profile";
    if (isArtworksRoute) return "Artworks";
    if (pathname === "/artist/messages") return "Messages";
    return "Dashboard";
  }, [isArtworksRoute, pathname]);

  useEffect(() => {
    if (!loading && profile) {
      if (normalizedStatus === "approved" && normalizedRole === "admin") {
        router.replace("/admin");
      }
      if (normalizedStatus === "pending" || normalizedStatus === "rejected") {
        router.replace("/pending");
      }
    }
  }, [loading, normalizedRole, normalizedStatus, profile, router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  if (loading) {
    return <DashboardShellSkeleton />;
  }

  if (!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 text-red-500 font-serif">
        <p>Unauthorized. Please log in to view this page.</p>
      </div>
    );
  }

  if (normalizedStatus === "pending") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 text-gray-500 font-serif">
        <p>Your artist application is pending approval.</p>
      </div>
    );
  }

  if (normalizedStatus === "rejected") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 text-red-500 font-serif">
        <p>Your application was not approved. Please contact Studio 201.</p>
      </div>
    );
  }

  if (normalizedStatus !== "approved" || normalizedRole !== "artist") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 text-red-500 font-serif">
        <p>Unauthorized. This area is for artists only.</p>
      </div>
    );
  }

  const publicSlug = profile.slug?.trim() || slugify(profile.fullName);
  const publicProfileHref = publicSlug ? `/artists/${publicSlug}` : "/artists";
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const navigation = [
    {
      label: "Workspace",
      items: [
        {
          href: "/artist/dashboard",
          label: "Dashboard",
          active: pathname === "/artist/dashboard" || pathname === "/dashboard",
          icon: (
            <svg
              className="artist-nav-icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="16"
              height="16"
            >
              <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
              <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
              <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
              <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
            </svg>
          ),
        },
        {
          href: "/artist/profile",
          label: "My Profile",
          active: pathname === "/artist/profile",
          icon: (
            <svg
              className="artist-nav-icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="16"
              height="16"
            >
              <circle cx="8" cy="5" r="3" />
              <path d="M2.5 14c1-3 3-4.5 5.5-4.5S12.5 11 13.5 14" />
            </svg>
          ),
        },
        {
          href: "/artist/artworks",
          label: "My Artworks",
          active: isArtworksRoute,
          icon: (
            <svg
              className="artist-nav-icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="16"
              height="16"
            >
              <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
              <circle cx="5" cy="5" r="1.25" />
              <path d="M2.5 11l3.5-4 2.5 2.5L11 6.5l2.5 4.5" />
            </svg>
          ),
        },
      ],
    },
    {
      label: "Explore",
      items: [
        {
          href: "/artist/messages",
          label: "Messages",
          active: pathname === "/artist/messages",
          icon: (
            <svg
              className="artist-nav-icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="16"
              height="16"
            >
              <rect x="1.5" y="2.5" width="13" height="10" rx="1.5" />
              <path d="M4 6h8M4 9h5" />
            </svg>
          ),
        },
        {
          href: "/exhibitions",
          label: "Exhibitions",
          active: pathname.startsWith("/exhibitions"),
          icon: (
            <svg
              className="artist-nav-icon"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="16"
              height="16"
            >
              <path d="M2.5 13.5L8 2.5l5.5 11H2.5z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <>
      <style jsx global>{`
        .artist-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 272px minmax(0, 1fr);
          background: #f6f3ee;
          color: #1a1612;
        }

        .artist-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 14, 10, 0.42);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 29;
        }

        .artist-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .artist-nav {
          background: linear-gradient(180deg, #2c1d11 0%, #23170e 100%);
          color: rgba(255, 255, 255, 0.84);
          min-height: 100vh;
          padding: 28px 18px 22px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .artist-nav-header {
          padding: 0 8px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .artist-logo-mark {
          width: 84px;
          height: 26px;
          display: block;
          flex-shrink: 0;
        }

        .artist-brand-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .artist-brand {
          font-family: var(--serif);
          font-size: 1.15rem;
          color: #f6f3ee;
          letter-spacing: 0.03em;
        }

        .artist-brand-sub {
          display: inline-block;
          margin-top: 4px;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.36);
        }

        .artist-nav-sections {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .artist-nav-label {
          display: block;
          padding: 0 10px 8px;
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.32);
        }

        .artist-nav-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .artist-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.68);
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
          font-size: 0.94rem;
        }

        .artist-nav-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.94);
        }

        .artist-nav-link.active {
          background: rgba(181, 96, 58, 0.24);
          color: #fff;
        }

        .artist-nav-icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          display: block;
        }

        .artist-nav-footer {
          margin-top: auto;
          padding: 16px 10px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .artist-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .artist-user-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(181, 96, 58, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--serif);
          color: #fff;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .artist-user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .artist-user-name {
          font-size: 0.96rem;
          color: #fff;
        }

        .artist-user-role {
          font-size: 0.74rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.42);
          margin-top: 2px;
        }

        .artist-nav-footer-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 0.84rem;
          transition: background 0.18s ease, border-color 0.18s ease;
        }

        .artist-nav-footer-link:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .artist-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .artist-topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 28px;
          border-bottom: 1px solid #ddd5ca;
          background: rgba(246, 243, 238, 0.92);
          backdrop-filter: blur(10px);
        }

        .artist-topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .artist-menu-btn {
          display: none;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid #ddd5ca;
          background: #fffdf8;
          color: #1a1612;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .artist-menu-btn svg {
          width: 18px;
          height: 18px;
        }

        .artist-breadcrumb {
          display: block;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.45);
          margin-bottom: 4px;
        }

        .artist-topbar-title {
          font-family: var(--serif);
          font-size: 1.35rem;
          font-weight: 400;
          color: #1a1612;
        }

        .artist-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .artist-date {
          font-size: 0.76rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
        }

        .artist-topbar-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid #d6cbbb;
          background: #fffdfa;
          color: #1a1612;
          text-decoration: none;
          font-size: 0.82rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          box-shadow: 0 6px 18px rgba(42, 28, 16, 0.06);
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .artist-topbar-link:hover {
          transform: translateY(-1px);
          border-color: #c4b39f;
          background: #fff8f0;
        }

        .artist-main-content {
          min-width: 0;
        }

        @media (max-width: 1080px) {
          .artist-shell {
            grid-template-columns: minmax(0, 1fr);
          }

          .artist-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: min(88vw, 320px);
            transform: translateX(-100%);
            transition: transform 0.22s ease;
            box-shadow: 20px 0 40px rgba(0, 0, 0, 0.18);
          }

          .artist-nav.open {
            transform: translateX(0);
          }

          .artist-menu-btn {
            display: inline-flex;
          }
        }

        @media (max-width: 720px) {
          .artist-topbar {
            padding: 14px 16px;
          }

          .artist-topbar-title {
            font-size: 1.12rem;
          }

          .artist-breadcrumb,
          .artist-date {
            display: none;
          }

          .artist-topbar-link {
            padding: 9px 13px;
            font-size: 0.74rem;
          }
        }
      `}</style>

      <div className="artist-shell">
        <div
          className={`artist-overlay ${navOpen ? "visible" : ""}`}
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />

        <aside className={`artist-nav ${navOpen ? "open" : ""}`}>
          <div className="artist-nav-header">
            <LogoMark className="artist-logo-mark" />
            <div className="artist-brand-block">
              <span className="artist-brand">Studio 201</span>
              <span className="artist-brand-sub">Artist Portal</span>
            </div>
          </div>

          <div className="artist-nav-sections">
            {navigation.map((section) => (
              <div key={section.label}>
                <span className="artist-nav-label">{section.label}</span>
                <ul className="artist-nav-list">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`artist-nav-link ${item.active ? "active" : ""}`}
                        aria-current={item.active ? "page" : undefined}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="artist-nav-footer">
            <div className="artist-user">
              <div className="artist-user-avatar">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={profile.fullName} />
                ) : (
                  profile.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="artist-user-name">{profile.fullName}</div>
                <div className="artist-user-role">{profile.role ?? profile.accountStatus}</div>
              </div>
            </div>

            <Link href={publicProfileHref} className="artist-nav-footer-link">
              View Public Page
            </Link>
          </div>
        </aside>

        <div className="artist-main">
          <header className="artist-topbar">
            <div className="artist-topbar-left">
              <button
                type="button"
                className="artist-menu-btn"
                onClick={() => setNavOpen((current) => !current)}
                aria-label="Toggle navigation"
                aria-expanded={navOpen}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 4h12M2 8h12M2 12h12" />
                </svg>
              </button>

              <div>
                <span className="artist-breadcrumb">Studio 201 / {breadcrumbLabel}</span>
                <div className="artist-topbar-title">{breadcrumbLabel}</div>
              </div>
            </div>

            <div className="artist-topbar-right">
              <span className="artist-date">{today}</span>
              <Link href="/artist/profile" className="artist-topbar-link">
                Profile
              </Link>
            </div>
          </header>

          <div className="artist-main-content">{children}</div>
        </div>
      </div>
    </>
  );
}
