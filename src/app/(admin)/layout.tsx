"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../../styles/dashboard.css";

export default function AdminLayout({
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
    <div className="page-view active dashboard-root" id="view-admin">
      <div className="dashboard w-full">
        {/* Admin Sidebar */}
        <aside className="sidebar admin-sidebar">
          <div className="sidebar-logo">
            <span className="sidebar-logo-text">Studio 201</span>
            <span className="sidebar-logo-sub">Curator Admin</span>
          </div>

          <span className="sidebar-section-label">Overview</span>
          <ul className="sidebar-nav">
            <li>
              <Link href="/admin" className={pathname === "/admin" ? "active" : ""}>
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
                  <path d="M8 1a6 6 0 100 12A6 6 0 008 1z" />
                  <path d="M8 5v4M8 11v.5" />
                </svg>
                Analytics
              </Link>
            </li>
          </ul>

          <span className="sidebar-section-label">Curation</span>
          <ul className="sidebar-nav">
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 11L5.5 7 8 9.5 10.5 6 14 11H2z" />
                  <rect x="1" y="1" width="14" height="14" rx="1" />
                </svg>
                Submissions
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3h10v2L8 11 3 5V3z" />
                </svg>
                Exhibitions
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 1v14M1 8h14" />
                </svg>
                New Exhibition
              </Link>
            </li>
          </ul>

          <span className="sidebar-section-label">Community</span>
          <ul className="sidebar-nav">
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="6" cy="5" r="3" />
                  <circle cx="11" cy="6" r="2.5" />
                  <path d="M1 14c0-2.5 2-4 5-4s5 1.5 5 4" />
                  <path d="M11 10c2 0 3.5 1 3.5 3" />
                </svg>
                Artists
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="14" height="10" rx="1" />
                  <path d="M5 4V2h6v2M1 8h14" />
                </svg>
                Events
              </Link>
            </li>
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="12" height="10" rx="1" />
                  <path d="M5 3V1M11 3V1M2 7h12" />
                </svg>
                Editions
              </Link>
            </li>
          </ul>

          <span className="sidebar-section-label">Settings</span>
          <ul className="sidebar-nav">
            <li>
              <Link href="#">
                <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="2" />
                  <path d="M8 2v1M8 13v1M2 8H1M15 8h-1M3.5 3.5l.7.7M11.8 11.8l.7.7M3.5 12.5l.7-.7M11.8 4.2l.7-.7" />
                </svg>
                Settings
              </Link>
            </li>
          </ul>

          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <div className="sidebar-avatar" style={{ background: 'var(--ochre)' }}>
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{profile.fullName}</div>
                <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>{profile.role}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <path d="M3 5l3 3 3-3" />
              </svg>
            </div>
          </div>
        </aside>

        {/* Admin Main */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <span className="breadcrumb">
                Studio 201 <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">Admin Dashboard</span>
              </span>
            </div>
            <div className="topbar-right">
              <span className="topbar-date">{today}</span>
              <button className="topbar-icon-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 1a5 5 0 015 5c0 3-1.5 4.5-1.5 6H3.5C3.5 10.5 2 9 2 6a5 5 0 015-5z" />
                  <path d="M5 12h4" />
                </svg>
                <span className="notif-dot" style={{ background: 'var(--ochre)' }}></span>
              </button>
              <button className="btn btn-terracotta btn-sm">+ New Exhibition</button>
            </div>
          </div>

          {children}

        </div>
      </div>
    </div>
  );
}
