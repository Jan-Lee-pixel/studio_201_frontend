"use client";

export const dynamic = "force-dynamic";

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useRef, useState } from "react";
import { artworkSubmissionService, ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";
import { portfolioService, PortfolioItem } from "@/features/portfolio/services/portfolioService";
import { ArtworkList } from "@/features/submissions/components/ArtworkList";
import { PortfolioList } from "@/features/portfolio/components/PortfolioList";
import { PortfolioForm } from "@/features/portfolio/components/PortfolioForm";
import { SubmissionForm } from "@/features/submissions/components/SubmissionForm";
import { ProfileCard } from "@/features/dashboard/components/ProfileCard";
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

type NoticeTone = "success" | "error";

export default function ArtistArtworksPage() {
  const { profile, session, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: NoticeTone; message: string } | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const setNoticeMessage = (message: string, tone: NoticeTone) => {
    setNotice({ tone, message });
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  const fetchSubmissions = async () => {
    if (!session?.access_token) return;
    setSubsLoading(true);
    try {
      const data = await artworkSubmissionService.getMySubmissions(session.access_token);
      setSubmissions(data);
    } catch (e) {
      console.error("Failed to fetch submissions:", e);
    } finally {
      setSubsLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    if (!session?.access_token) return;
    setPortfolioLoading(true);
    try {
      const data = await portfolioService.getMyPortfolio(session.access_token);
      setPortfolioItems(data);
    } catch (e) {
      console.error("Failed to fetch portfolio:", e);
    } finally {
      setPortfolioLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchPortfolio();
  }, [session?.access_token]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        window.clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  const handleTogglePortfolioVisibility = async (item: PortfolioItem) => {
    if (!session?.access_token) return;
    const nextValue = !item.isPublic;
    setPortfolioItems((prev) =>
      prev.map((portfolioItem) =>
        portfolioItem.id === item.id ? { ...portfolioItem, isPublic: nextValue } : portfolioItem
      )
    );
    try {
      const updated = await portfolioService.updatePortfolioItem(
        item.id,
        { isPublic: nextValue },
        session.access_token
      );
      setPortfolioItems((prev) =>
        prev.map((portfolioItem) => (portfolioItem.id === item.id ? updated : portfolioItem))
      );
      setNoticeMessage(
        nextValue ? "Artwork is now public on your profile." : "Artwork moved to private.",
        "success"
      );
    } catch (error) {
      console.error("Failed to update portfolio visibility:", error);
      setPortfolioItems((prev) =>
        prev.map((portfolioItem) => (portfolioItem.id === item.id ? item : portfolioItem))
      );
      setNoticeMessage("Failed to update visibility. Please try again.", "error");
    }
  };

  const handleDeletePortfolioItem = async (item: PortfolioItem) => {
    if (!session?.access_token) return;
    const confirmed = window.confirm(`Remove "${item.title}" from your portfolio?`);
    if (!confirmed) return;
    const snapshot = portfolioItems;
    setPortfolioItems((prev) => prev.filter((portfolioItem) => portfolioItem.id !== item.id));
    try {
      await portfolioService.deletePortfolioItem(item.id, session.access_token);
      setNoticeMessage("Portfolio item removed.", "success");
    } catch (error) {
      console.error("Failed to delete portfolio item:", error);
      setPortfolioItems(snapshot);
      setNoticeMessage("Failed to remove item. Please try again.", "error");
    }
  };

  if (authLoading) {
    return <DashboardContentSkeleton />;
  }

  if (!profile || !session?.access_token) {
    return <div className="p-8 text-red-500 font-dm-mono text-sm">User profile not found. Please log in again.</div>;
  }

  const slug =
    profile.slug?.trim() ||
    profile.fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const totalPortfolio = portfolioItems.length;
  const publicPortfolio = portfolioItems.filter((item) => item.isPublic).length;
  const totalSubmissions = submissions.length;

  return (
    <div className="content">
      <div className="page-header">
        <div className="status-chip">Portfolio</div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">My Artworks</h1>
            <p className="page-subtitle">Manage your public portfolio and track submissions sent to Studio 201.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                const target = document.getElementById("portfolio-upload");
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Add Showcase
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                const target = document.getElementById("new-submission");
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              New Submission
            </button>
            <button
              className="btn btn-terracotta"
              onClick={() => {
                window.location.href = slug ? `/artists/${slug}` : "/artists";
              }}
            >
              Public Page
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 mb-4 text-sm font-dm-mono rounded ${
            notice.tone === "error" ? "text-red-600 bg-red-50" : "text-emerald-700 bg-emerald-50"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="stats-row stats-3 mb-20">
        <div className="stat-card accent-terra">
          <div className="stat-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 11L5 7l2.5 2.5L9.5 5 12 11H2z" />
            </svg>
          </div>
          <p className="stat-label">Portfolio Items</p>
          <p className="stat-value">{portfolioLoading ? "—" : totalPortfolio}</p>
          <p className="stat-delta">{portfolioLoading ? "" : `${publicPortfolio} public`}</p>
        </div>

        <div className="stat-card accent-ochre">
          <div className="stat-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="5" />
              <path d="M7 4v3l2 2" />
            </svg>
          </div>
          <p className="stat-label">Submissions</p>
          <p className="stat-value">{subsLoading ? "—" : totalSubmissions}</p>
          <p className="stat-sub">{subsLoading ? "" : "Sent to curators"}</p>
        </div>

        <div className="stat-card accent-sage">
          <div className="stat-icon-wrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10l3-4 2 2 2-3 3 5" />
            </svg>
          </div>
          <p className="stat-label">Approved</p>
          <p className="stat-value">
            {subsLoading ? "—" : submissions.filter((s) => s.status === "Approved").length}
          </p>
          <p className="stat-sub">{subsLoading ? "" : "Ready for exhibition"}</p>
        </div>
      </div>

      <div className="grid-3-1">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <PortfolioList
            items={portfolioItems}
            loading={portfolioLoading}
            onTogglePublic={handleTogglePortfolioVisibility}
            onDelete={handleDeletePortfolioItem}
          />

          <PortfolioForm
            token={session.access_token}
            artistId={profile.id}
            authUserId={session.user.id}
            onSuccess={fetchPortfolio}
          />

          <ArtworkList submissions={submissions} loading={subsLoading} showViewLink />

          <SubmissionForm
            token={session.access_token}
            artistId={profile.id}
            onSuccess={fetchSubmissions}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <ProfileCard profile={profile} submissions={submissions} loading={subsLoading} />

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Portfolio Tips</h2>
            </div>
            <div className="card-body" style={{ fontSize: "12px", color: "var(--warm-mid)", lineHeight: 1.6 }}>
              <p>Highlight 6–12 strongest works with clear titles, year, and medium.</p>
              <p style={{ marginTop: "10px" }}>
                Only items marked Public appear on your public profile. Keep drafts private while refining details.
              </p>
              <p style={{ marginTop: "10px" }}>
                Exhibition submissions are reviewed separately by curators and can be updated anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
