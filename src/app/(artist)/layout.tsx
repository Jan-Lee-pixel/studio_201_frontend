"use client";

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../../styles/dashboard.css";

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="p-8 text-gray-500 font-dm-mono text-sm">Loading workspace...</div>;
  }

  if (!profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 text-red-500 font-serif">
        <p>Unauthorized. Please log in to view this page.</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="page-view active dashboard-root" id="view-artist">
      <div className="dashboard w-full">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="sidebar-logo-text">Studio 201</span>
            <span className="sidebar-logo-sub">Artist Portal</span>
          </div>

          <span className="sidebar-section-label">Overview</span>
          <ul className="sidebar-nav">
            <li>
              <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""}>
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="6" height="6" rx="1" />
                  <rect x="9" y="1" width="6" height="6" rx="1" />
                  <rect x="1" y="9" width="6" height="6" rx="1" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="14" height="10" rx="1" />
                  <path d="M5 3V2M11 3V2" />
                </svg>
                My Profile
              </Link>
            </li>
          </ul>

          <span className="sidebar-section-label">Artworks</span>
          <ul className="sidebar-nav">
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 12L6 7l3 3 2-2.5L14 12" />
                  <circle cx="5" cy="5" r="1.5" />
                  <rect x="1" y="1" width="14" height="14" rx="1" />
                </svg>
                My Artworks
                <span className="nav-badge">4</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3l2 2" />
                </svg>
                Submissions
                <span className="nav-badge">1</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 1v14M1 8h14" />
                </svg>
                New Submission
              </Link>
            </li>
          </ul>

          <span className="sidebar-section-label">Gallery</span>
          <ul className="sidebar-nav">
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 14L8 2l7 12H1z" />
                </svg>
                Exhibitions
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="14" height="10" rx="1" />
                  <path d="M5 7h6M5 10h4" />
                </svg>
                Messages
                <span className="nav-badge">2</span>
              </Link>
            </li>
          </ul>

          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{profile.fullName}</div>
                <div className="sidebar-user-role">Artist</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <path d="M3 5l3 3 3-3" />
              </svg>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <span className="breadcrumb">
                Studio 201 <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">Dashboard</span>
              </span>
            </div>
            <div className="topbar-right">
              <span className="topbar-date">{today}</span>
              <button className="topbar-icon-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 1a5 5 0 015 5c0 3-1.5 4.5-1.5 6H3.5C3.5 10.5 2 9 2 6a5 5 0 015-5z" />
                  <path d="M5 12h4" />
                </svg>
                <span className="notif-dot"></span>
              </button>
              <button className="topbar-icon-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="5" r="3" />
                  <path d="M1 13c0-3 2.7-5 6-5s6 2 6 5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Page Content injected here */}
          {children}

        </div>
      </div>
    </div>
  );
}
