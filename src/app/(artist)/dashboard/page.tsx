"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  artworkSubmissionService,
  ArtworkSubmission,
} from "@/features/submissions/services/artworkSubmissionService";
import {
  portfolioService,
  PortfolioItem,
} from "@/features/portfolio/services/portfolioService";
import { SubmissionForm } from "@/features/submissions/components/SubmissionForm";
import { PortfolioForm } from "@/features/portfolio/components/PortfolioForm";
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";
import { PortalLink } from "@/components/ui/PortalLink";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatLongMonth(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "approved") return "sage";
  if (normalized === "pending") return "ochre";
  if (normalized === "rejected") return "terra";
  return "muted";
}

function parseSubmissionDescription(description?: string | null) {
  const lines = (description || "").split("\n");
  const noteLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("Year: ") || line.startsWith("Medium: ") || line.startsWith("Dimensions: ")) {
      continue;
    }
    noteLines.push(line);
  }

  return noteLines.join("\n").trim();
}

function buildSubmissionMeta(item: ArtworkSubmission) {
  const detail = parseSubmissionDescription(item.description);
  return [
    item.category,
    item.artType,
    `Submitted ${formatShortDate(item.createdAt)}`,
    detail ? `${detail.slice(0, 72)}${detail.length > 72 ? "..." : ""}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildPortfolioMeta(item: PortfolioItem) {
  return [item.category, item.artType, item.year, item.medium, item.dimensions]
    .filter(Boolean)
    .join(" · ");
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="artist-dashboard-statCard">
      <div className="artist-dashboard-statLabel">{label}</div>
      <div className="artist-dashboard-statValue">{value}</div>
      <div className="artist-dashboard-statNote">{note}</div>
    </div>
  );
}

export default function ArtistDashboardPage() {
  const { profile, session, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [openSubmissionPanel, setOpenSubmissionPanel] = useState(false);
  const [openPortfolioPanel, setOpenPortfolioPanel] = useState(false);

  const fetchSubmissions = async () => {
    if (!session?.access_token) return;
    setSubmissionsLoading(true);
    try {
      const data = await artworkSubmissionService.getMySubmissions(session.access_token);
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    if (!session?.access_token) return;
    setPortfolioLoading(true);
    try {
      const data = await portfolioService.getMyPortfolio(session.access_token);
      setPortfolioItems(data);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  useEffect(() => {
    void fetchSubmissions();
    void fetchPortfolio();
  }, [session?.access_token]);

  useEffect(() => {
    if (!submissionsLoading && submissions.length === 0) {
      setOpenSubmissionPanel(true);
    }
  }, [submissions.length, submissionsLoading]);

  if (authLoading) {
    return <DashboardContentSkeleton />;
  }

  if (!profile || !session?.access_token) {
    return (
      <div className="p-8 text-red-500 font-dm-mono text-sm">
        User profile not found. Please log in again.
      </div>
    );
  }

  const slug = profile.slug?.trim() || slugify(profile.fullName);
  const publicProfileHref = slug ? `/artists/${slug}` : "/artists";
  const manageArtworksHref = "/artist/artworks/manage";
  const orderedSubmissions = [...submissions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const orderedPortfolio = [...portfolioItems].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
  const recentSubmissions = orderedSubmissions.slice(0, 3);
  const recentPortfolio = orderedPortfolio.slice(0, 3);
  const approvedCount = submissions.filter((item) => item.status === "Approved").length;
  const pendingCount = submissions.filter((item) => item.status === "Pending").length;
  const publicPortfolioCount = portfolioItems.filter((item) => item.isPublic).length;
  const readyForPublicProfile = Boolean(profile.bio?.trim()) && publicPortfolioCount > 0;
  const nextStep =
    submissions.length === 0
      ? "Submit your first artwork for review."
      : publicPortfolioCount === 0
        ? "Add one strong piece to your public portfolio."
        : "Keep your profile and artworks current.";

  const scrollToPanel = (panelId: string) => {
    window.setTimeout(() => {
      document.getElementById(panelId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <>
      <style jsx global>{`
        .artist-dashboard-page {
          padding: clamp(16px, 3vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .artist-dashboard-card,
        .artist-dashboard-hero,
        .artist-dashboard-panel,
        .artist-dashboard-composer {
          background: #fffdfa;
          border: 1px solid #ddd5ca;
          border-radius: 24px;
          box-shadow: 0 12px 28px rgba(42, 28, 16, 0.04);
        }

        .artist-dashboard-hero {
          padding: clamp(22px, 3vw, 32px);
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.95fr);
          gap: 22px;
        }

        .artist-dashboard-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #e7f0e8;
          color: #66896a;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .artist-dashboard-status::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .artist-dashboard-title {
          font-family: var(--serif);
          font-size: clamp(2.2rem, 4.2vw, 3.6rem);
          line-height: 0.96;
          color: #1a1612;
          margin: 0;
        }

        .artist-dashboard-title span {
          color: #b5603a;
        }

        .artist-dashboard-copy {
          margin-top: 14px;
          max-width: 620px;
          color: #78695c;
          line-height: 1.7;
          font-size: 1rem;
        }

        .artist-dashboard-actions {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .artist-dashboard-button,
        .artist-dashboard-buttonSecondary,
        .artist-dashboard-linkButton,
        .artist-dashboard-inlineButton,
        .artist-dashboard-textButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 999px;
          text-decoration: none;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
          cursor: pointer;
          font-family: inherit;
        }

        .artist-dashboard-button,
        .artist-dashboard-buttonSecondary,
        .artist-dashboard-linkButton {
          padding: 12px 18px;
          border: 1px solid #d8cebf;
          font-size: 0.82rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .artist-dashboard-button {
          background: #1a1612;
          color: #fffdfa;
          border-color: #1a1612;
        }

        .artist-dashboard-buttonSecondary,
        .artist-dashboard-linkButton {
          background: #fffaf4;
          color: #1a1612;
        }

        .artist-dashboard-button:hover,
        .artist-dashboard-buttonSecondary:hover,
        .artist-dashboard-linkButton:hover,
        .artist-dashboard-inlineButton:hover,
        .artist-dashboard-textButton:hover {
          transform: translateY(-1px);
        }

        .artist-dashboard-guide {
          background: #f9f4eb;
          border: 1px solid #ebe2d6;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .artist-dashboard-kicker {
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
        }

        .artist-dashboard-guideTitle,
        .artist-dashboard-sectionTitle,
        .artist-dashboard-profileName {
          font-family: var(--serif);
          color: #1a1612;
        }

        .artist-dashboard-guideTitle {
          font-size: 1.5rem;
        }

        .artist-dashboard-guideCopy,
        .artist-dashboard-sectionCopy,
        .artist-dashboard-rowMeta,
        .artist-dashboard-profileValue {
          color: #74675b;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .artist-dashboard-guideList,
        .artist-dashboard-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .artist-dashboard-guideItem,
        .artist-dashboard-checkItem {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .artist-dashboard-guideItem::before,
        .artist-dashboard-checkItem::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 8px;
          flex-shrink: 0;
          background: #b5603a;
        }

        .artist-dashboard-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .artist-dashboard-statCard {
          background: #fffdfa;
          border: 1px solid #ddd5ca;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 22px rgba(42, 28, 16, 0.03);
        }

        .artist-dashboard-statLabel {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
          margin-bottom: 10px;
        }

        .artist-dashboard-statValue {
          font-family: var(--serif);
          font-size: 2rem;
          color: #1a1612;
          line-height: 1;
          margin-bottom: 8px;
        }

        .artist-dashboard-statNote {
          color: #78695c;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .artist-dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.95fr);
          gap: 20px;
          align-items: start;
        }

        .artist-dashboard-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .artist-dashboard-panel,
        .artist-dashboard-card {
          padding: 22px;
        }

        .artist-dashboard-panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .artist-dashboard-sectionTitle {
          font-size: 1.45rem;
          margin: 0;
        }

        .artist-dashboard-textButton {
          padding: 10px 14px;
          border: 1px solid #ddd5ca;
          background: #fffaf4;
          color: #1a1612;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .artist-dashboard-list {
          display: flex;
          flex-direction: column;
        }

        .artist-dashboard-row {
          display: grid;
          grid-template-columns: 60px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: 14px 0;
          border-top: 1px solid #eee5d9;
        }

        .artist-dashboard-row:first-child {
          border-top: none;
          padding-top: 0;
        }

        .artist-dashboard-row:last-child {
          padding-bottom: 0;
        }

        .artist-dashboard-media {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #ecd9cf 0%, #f1ebe2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8d6b56;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .artist-dashboard-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .artist-dashboard-rowTitle {
          color: #1a1612;
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .artist-dashboard-rowSide {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .artist-dashboard-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 11px;
          border-radius: 999px;
          font-size: 0.7rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .artist-dashboard-chip.sage {
          background: #e7f0e8;
          color: #698d6c;
        }

        .artist-dashboard-chip.ochre {
          background: #f6ecdb;
          color: #b07e24;
        }

        .artist-dashboard-chip.terra {
          background: #f2e2db;
          color: #b5603a;
        }

        .artist-dashboard-chip.muted {
          background: #f2ece4;
          color: #83766a;
        }

        .artist-dashboard-inlineButton {
          padding: 8px 12px;
          border: 1px solid #ddd5ca;
          background: #fffaf4;
          color: #1a1612;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .artist-dashboard-empty {
          color: #7b6d61;
          font-size: 0.95rem;
          line-height: 1.7;
          padding-top: 2px;
        }

        .artist-dashboard-profileTop {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }

        .artist-dashboard-avatar {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, #b5603a 0%, #925032 100%);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--serif);
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .artist-dashboard-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .artist-dashboard-profileName {
          font-size: 1.4rem;
          margin: 0;
        }

        .artist-dashboard-profileHandle {
          margin-top: 4px;
          color: #8a7a6a;
          font-size: 0.9rem;
        }

        .artist-dashboard-profileMeta {
          display: grid;
          gap: 12px;
        }

        .artist-dashboard-profileRow {
          display: grid;
          grid-template-columns: 102px minmax(0, 1fr);
          gap: 12px;
          align-items: start;
          padding-top: 12px;
          border-top: 1px solid #ede4d8;
        }

        .artist-dashboard-profileLabel {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
        }

        .artist-dashboard-profileValue a {
          color: #b5603a;
          text-decoration: none;
        }

        .artist-dashboard-profileActions {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .artist-dashboard-composer {
          overflow: hidden;
        }

        .artist-dashboard-composerTrigger {
          width: 100%;
          padding: 22px;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          text-align: left;
          cursor: pointer;
        }

        .artist-dashboard-composerTitle {
          color: #1a1612;
          font-size: 1.05rem;
          margin-bottom: 6px;
        }

        .artist-dashboard-composerCopy {
          color: #7a6d62;
          font-size: 0.94rem;
          line-height: 1.6;
        }

        .artist-dashboard-composerChevron {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd5ca;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: #7a6d62;
          flex-shrink: 0;
          transition: transform 0.18s ease;
        }

        .artist-dashboard-composerChevron.open {
          transform: rotate(45deg);
        }

        .artist-dashboard-composerBody {
          padding: 0 22px 22px;
        }

        @media (max-width: 1080px) {
          .artist-dashboard-hero,
          .artist-dashboard-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 780px) {
          .artist-dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .artist-dashboard-row {
            grid-template-columns: 52px minmax(0, 1fr);
          }

          .artist-dashboard-rowSide {
            grid-column: 1 / -1;
            align-items: flex-start;
            padding-left: 66px;
          }

          .artist-dashboard-profileRow {
            grid-template-columns: minmax(0, 1fr);
            gap: 6px;
          }
        }

        @media (max-width: 560px) {
          .artist-dashboard-stats {
            grid-template-columns: minmax(0, 1fr);
          }

          .artist-dashboard-actions,
          .artist-dashboard-profileActions {
            flex-direction: column;
            align-items: stretch;
          }

          .artist-dashboard-button,
          .artist-dashboard-buttonSecondary,
          .artist-dashboard-linkButton,
          .artist-dashboard-textButton {
            width: 100%;
          }

          .artist-dashboard-panelHeader {
            flex-direction: column;
            align-items: flex-start;
          }

          .artist-dashboard-composerTrigger {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="content">
        <div className="artist-dashboard-page">
          <section className="artist-dashboard-hero">
            <div>
              <div className="artist-dashboard-status">{profile.accountStatus}</div>
              <h1 className="artist-dashboard-title">
                Welcome back,
                <br />
                <span>{profile.fullName}</span>
              </h1>
              <p className="artist-dashboard-copy">
                Your dashboard is now focused on the basics: what to submit, what is public, and
                what needs attention next.
              </p>

              <div className="artist-dashboard-actions">
                <button
                  type="button"
                  className="artist-dashboard-button"
                  onClick={() => {
                    setOpenSubmissionPanel(true);
                    scrollToPanel("artist-dashboard-submission-panel");
                  }}
                >
                  Submit Artwork
                </button>
                <button
                  type="button"
                  className="artist-dashboard-buttonSecondary"
                  onClick={() => {
                    setOpenPortfolioPanel(true);
                    scrollToPanel("artist-dashboard-portfolio-panel");
                  }}
                >
                  Add Public Work
                </button>
                <PortalLink href={manageArtworksHref} className="artist-dashboard-linkButton">
                  View All Artworks
                </PortalLink>
                <PortalLink href={publicProfileHref} className="artist-dashboard-linkButton">
                  Public Page
                </PortalLink>
              </div>
            </div>

            <div className="artist-dashboard-guide">
              <div className="artist-dashboard-kicker">What to do next</div>
              <h2 className="artist-dashboard-guideTitle">{nextStep}</h2>
              <p className="artist-dashboard-guideCopy">
                Keep this simple: send work for review, pick a few strong public pieces, and make
                sure your profile feels complete.
              </p>

              <div className="artist-dashboard-guideList">
                <div className="artist-dashboard-guideItem">
                  <div>
                    <strong>{pendingCount}</strong> submission{pendingCount === 1 ? "" : "s"} still in review.
                  </div>
                </div>
                <div className="artist-dashboard-guideItem">
                  <div>
                    <strong>{publicPortfolioCount}</strong> artwork{publicPortfolioCount === 1 ? "" : "s"} visible on your public page.
                  </div>
                </div>
                <div className="artist-dashboard-guideItem">
                  <div>
                    Public profile is{" "}
                    <strong>{readyForPublicProfile ? "ready to share" : "still incomplete"}</strong>.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="artist-dashboard-stats">
            <StatCard
              label="Submitted"
              value={submissionsLoading ? "..." : submissions.length}
              note="Total works sent to Studio 201"
            />
            <StatCard
              label="Approved"
              value={submissionsLoading ? "..." : approvedCount}
              note={approvedCount > 0 ? "Ready for gallery use" : "Nothing approved yet"}
            />
            <StatCard
              label="In Review"
              value={submissionsLoading ? "..." : pendingCount}
              note={pendingCount > 0 ? "Waiting for curator feedback" : "No pending reviews"}
            />
            <StatCard
              label="Public Works"
              value={portfolioLoading ? "..." : publicPortfolioCount}
              note="Visible on your artist page"
            />
          </section>

          <div className="artist-dashboard-grid">
            <div className="artist-dashboard-column">
              <section className="artist-dashboard-panel">
                <div className="artist-dashboard-panelHeader">
                  <div>
                    <div className="artist-dashboard-kicker">Recent reviews</div>
                    <h2 className="artist-dashboard-sectionTitle">Latest submissions</h2>
                  </div>
                  <PortalLink href={manageArtworksHref} className="artist-dashboard-textButton">
                    Manage all
                  </PortalLink>
                </div>

                {submissionsLoading ? (
                  <div className="artist-dashboard-empty">Loading your submissions...</div>
                ) : recentSubmissions.length === 0 ? (
                  <div className="artist-dashboard-empty">
                    No submissions yet. Use the main action above to send your first artwork for review.
                  </div>
                ) : (
                  <div className="artist-dashboard-list">
                    {recentSubmissions.map((item) => (
                      <div className="artist-dashboard-row" key={item.id}>
                        <div className="artist-dashboard-media">
                          {item.mediaAssetUrl ? <img src={item.mediaAssetUrl} alt={item.title} /> : "Art"}
                        </div>
                        <div>
                          <div className="artist-dashboard-rowTitle">{item.title}</div>
                          <div className="artist-dashboard-rowMeta">
                            {buildSubmissionMeta(item) || "Artwork submission"}
                          </div>
                        </div>
                        <div className="artist-dashboard-rowSide">
                          <span className={`artist-dashboard-chip ${getStatusTone(item.status)}`}>
                            {item.status}
                          </span>
                          <PortalLink href={manageArtworksHref} className="artist-dashboard-inlineButton">
                            Manage
                          </PortalLink>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="artist-dashboard-panel">
                <div className="artist-dashboard-panelHeader">
                  <div>
                    <div className="artist-dashboard-kicker">Public portfolio</div>
                    <h2 className="artist-dashboard-sectionTitle">Showcase preview</h2>
                  </div>
                  <PortalLink href={manageArtworksHref} className="artist-dashboard-textButton">
                    View all artworks
                  </PortalLink>
                </div>

                {portfolioLoading ? (
                  <div className="artist-dashboard-empty">Loading your public artworks...</div>
                ) : recentPortfolio.length === 0 ? (
                  <div className="artist-dashboard-empty">
                    Your public portfolio is still empty. Add one or two strong pieces so visitors
                    see something right away.
                  </div>
                ) : (
                  <div className="artist-dashboard-list">
                    {recentPortfolio.map((item) => (
                      <div className="artist-dashboard-row" key={item.id}>
                        <div className="artist-dashboard-media">
                          {item.mediaAssetUrl ? <img src={item.mediaAssetUrl} alt={item.title} /> : "Work"}
                        </div>
                        <div>
                          <div className="artist-dashboard-rowTitle">{item.title}</div>
                          <div className="artist-dashboard-rowMeta">
                            {buildPortfolioMeta(item) || "Portfolio artwork"}
                          </div>
                        </div>
                        <div className="artist-dashboard-rowSide">
                          <span className={`artist-dashboard-chip ${item.isPublic ? "sage" : "muted"}`}>
                            {item.isPublic ? "Public" : "Private"}
                          </span>
                          <PortalLink href={manageArtworksHref} className="artist-dashboard-inlineButton">
                            Manage
                          </PortalLink>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="artist-dashboard-composer" id="artist-dashboard-submission-panel">
                <button
                  type="button"
                  className="artist-dashboard-composerTrigger"
                  onClick={() => setOpenSubmissionPanel((current) => !current)}
                  aria-expanded={openSubmissionPanel}
                >
                  <div>
                    <div className="artist-dashboard-composerTitle">Submit new artwork</div>
                    <div className="artist-dashboard-composerCopy">
                      Use this when you want Studio 201 to review a piece for exhibition.
                    </div>
                  </div>
                  <div className={`artist-dashboard-composerChevron ${openSubmissionPanel ? "open" : ""}`}>
                    +
                  </div>
                </button>

                {openSubmissionPanel ? (
                  <div className="artist-dashboard-composerBody">
                    <SubmissionForm
                      token={session.access_token}
                      artistId={profile.id}
                      onSuccess={fetchSubmissions}
                    />
                  </div>
                ) : null}
              </section>

              <section className="artist-dashboard-composer" id="artist-dashboard-portfolio-panel">
                <button
                  type="button"
                  className="artist-dashboard-composerTrigger"
                  onClick={() => setOpenPortfolioPanel((current) => !current)}
                  aria-expanded={openPortfolioPanel}
                >
                  <div>
                    <div className="artist-dashboard-composerTitle">Add showcase artwork</div>
                    <div className="artist-dashboard-composerCopy">
                      Use this for works that should appear on your public artist page.
                    </div>
                  </div>
                  <div className={`artist-dashboard-composerChevron ${openPortfolioPanel ? "open" : ""}`}>
                    +
                  </div>
                </button>

                {openPortfolioPanel ? (
                  <div className="artist-dashboard-composerBody">
                    <PortfolioForm
                      token={session.access_token}
                      artistId={profile.id}
                      authUserId={session.user.id}
                      onSuccess={fetchPortfolio}
                    />
                  </div>
                ) : null}
              </section>
            </div>

            <div className="artist-dashboard-column">
              <section className="artist-dashboard-card">
                <div className="artist-dashboard-profileTop">
                  <div className="artist-dashboard-avatar">
                    {profile.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt={profile.fullName} />
                    ) : (
                      <StudioImagePlaceholder
                        className="w-full h-full rounded-full"
                        markClassName="w-7"
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="artist-dashboard-profileName">{profile.fullName}</h2>
                    <div className="artist-dashboard-profileHandle">
                      @{slug || "artist"} · {profile.role ?? profile.accountStatus}
                    </div>
                  </div>
                </div>

                <div className="artist-dashboard-profileMeta">
                  <div className="artist-dashboard-profileRow">
                    <div className="artist-dashboard-profileLabel">Email</div>
                    <div className="artist-dashboard-profileValue">
                      <a href={`mailto:${profile.email}`}>{profile.email}</a>
                    </div>
                  </div>
                  <div className="artist-dashboard-profileRow">
                    <div className="artist-dashboard-profileLabel">Member since</div>
                    <div className="artist-dashboard-profileValue">{formatLongMonth(profile.createdAt)}</div>
                  </div>
                  <div className="artist-dashboard-profileRow">
                    <div className="artist-dashboard-profileLabel">Public page</div>
                    <div className="artist-dashboard-profileValue">
                      <a href={publicProfileHref}>Open artist page</a>
                    </div>
                  </div>
                  <div className="artist-dashboard-profileRow">
                    <div className="artist-dashboard-profileLabel">Status</div>
                    <div className="artist-dashboard-profileValue">
                      {readyForPublicProfile
                        ? "Ready to share publicly"
                        : "Add a bio and at least one public artwork"}
                    </div>
                  </div>
                </div>

                <div className="artist-dashboard-profileActions">
                  <PortalLink href="/artist/profile" className="artist-dashboard-linkButton">
                    Edit Profile
                  </PortalLink>
                  <PortalLink href={publicProfileHref} className="artist-dashboard-linkButton">
                    Public Page
                  </PortalLink>
                </div>
              </section>

              <section className="artist-dashboard-card">
                <div className="artist-dashboard-kicker">Simple workflow</div>
                <h2 className="artist-dashboard-sectionTitle">Use this like a checklist</h2>
                <p className="artist-dashboard-sectionCopy">
                  The portal is easiest when each page has one job: submit, manage, or update your
                  public profile.
                </p>

                <div className="artist-dashboard-checklist">
                  <div className="artist-dashboard-checkItem">
                    <div>Submit work when you want curator review.</div>
                  </div>
                  <div className="artist-dashboard-checkItem">
                    <div>Keep only your best pieces public.</div>
                  </div>
                  <div className="artist-dashboard-checkItem">
                    <div>Use the full artworks page when you need edits or cleanup.</div>
                  </div>
                </div>

                <div className="artist-dashboard-profileActions">
                  <PortalLink href={manageArtworksHref} className="artist-dashboard-linkButton">
                    Manage Artworks
                  </PortalLink>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
