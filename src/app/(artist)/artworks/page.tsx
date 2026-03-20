"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
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
import { PortfolioForm } from "@/features/portfolio/components/PortfolioForm";
import { SubmissionForm } from "@/features/submissions/components/SubmissionForm";
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

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

function getSubmissionTone(status: string) {
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
    <div className="artist-artworks-statCard">
      <div className="artist-artworks-statLabel">{label}</div>
      <div className="artist-artworks-statValue">{value}</div>
      <div className="artist-artworks-statNote">{note}</div>
    </div>
  );
}

export default function ArtistArtworksPage() {
  const { profile, session, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [openPortfolioPanel, setOpenPortfolioPanel] = useState(false);
  const [openSubmissionPanel, setOpenSubmissionPanel] = useState(false);

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
    if (!portfolioLoading && portfolioItems.length === 0) {
      setOpenPortfolioPanel(true);
    }
  }, [portfolioItems.length, portfolioLoading]);

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
  const approvedCount = submissions.filter((item) => item.status === "Approved").length;
  const pendingCount = submissions.filter((item) => item.status === "Pending").length;
  const publicCount = portfolioItems.filter((item) => item.isPublic).length;
  const recentPortfolio = [...portfolioItems]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 3);
  const recentSubmissions = [...submissions]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 3);

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
        .artist-artworks-page {
          padding: clamp(16px, 3vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .artist-artworks-hero,
        .artist-artworks-panel,
        .artist-artworks-composer {
          background: #fffdfa;
          border: 1px solid #ddd5ca;
          border-radius: 24px;
          box-shadow: 0 12px 28px rgba(42, 28, 16, 0.04);
        }

        .artist-artworks-hero {
          padding: clamp(22px, 3vw, 32px);
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.95fr);
          gap: 22px;
        }

        .artist-artworks-status {
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

        .artist-artworks-status::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .artist-artworks-title {
          font-family: var(--serif);
          font-size: clamp(2.2rem, 4vw, 3.4rem);
          line-height: 0.96;
          color: #1a1612;
          margin: 0;
        }

        .artist-artworks-copy,
        .artist-artworks-guideCopy,
        .artist-artworks-rowMeta,
        .artist-artworks-profileValue,
        .artist-artworks-sectionCopy {
          color: #75685c;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .artist-artworks-copy {
          margin-top: 14px;
          max-width: 620px;
          font-size: 1rem;
        }

        .artist-artworks-actions {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .artist-artworks-button,
        .artist-artworks-buttonSecondary,
        .artist-artworks-linkButton,
        .artist-artworks-inlineButton,
        .artist-artworks-textButton {
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

        .artist-artworks-button,
        .artist-artworks-buttonSecondary,
        .artist-artworks-linkButton {
          padding: 12px 18px;
          border: 1px solid #d8cebf;
          font-size: 0.82rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .artist-artworks-button {
          background: #1a1612;
          color: #fffdfa;
          border-color: #1a1612;
        }

        .artist-artworks-buttonSecondary,
        .artist-artworks-linkButton,
        .artist-artworks-textButton,
        .artist-artworks-inlineButton {
          background: #fffaf4;
          color: #1a1612;
          border: 1px solid #ddd5ca;
        }

        .artist-artworks-button:hover,
        .artist-artworks-buttonSecondary:hover,
        .artist-artworks-linkButton:hover,
        .artist-artworks-textButton:hover,
        .artist-artworks-inlineButton:hover {
          transform: translateY(-1px);
        }

        .artist-artworks-guide {
          background: #f9f4eb;
          border: 1px solid #ebe2d6;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .artist-artworks-kicker {
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
        }

        .artist-artworks-guideTitle,
        .artist-artworks-sectionTitle {
          font-family: var(--serif);
          color: #1a1612;
        }

        .artist-artworks-guideTitle {
          font-size: 1.48rem;
        }

        .artist-artworks-guideList,
        .artist-artworks-ruleList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .artist-artworks-guideItem,
        .artist-artworks-ruleItem {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .artist-artworks-guideItem::before,
        .artist-artworks-ruleItem::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 8px;
          flex-shrink: 0;
          background: #b5603a;
        }

        .artist-artworks-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .artist-artworks-statCard {
          background: #fffdfa;
          border: 1px solid #ddd5ca;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 22px rgba(42, 28, 16, 0.03);
        }

        .artist-artworks-statLabel {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
          margin-bottom: 10px;
        }

        .artist-artworks-statValue {
          font-family: var(--serif);
          font-size: 2rem;
          line-height: 1;
          color: #1a1612;
          margin-bottom: 8px;
        }

        .artist-artworks-statNote {
          color: #78695c;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .artist-artworks-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .artist-artworks-panel {
          padding: 22px;
        }

        .artist-artworks-panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .artist-artworks-sectionTitle {
          font-size: 1.45rem;
          margin: 0;
        }

        .artist-artworks-textButton {
          padding: 10px 14px;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .artist-artworks-list {
          display: flex;
          flex-direction: column;
        }

        .artist-artworks-row {
          display: grid;
          grid-template-columns: 60px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: 14px 0;
          border-top: 1px solid #eee5d9;
        }

        .artist-artworks-row:first-child {
          border-top: none;
          padding-top: 0;
        }

        .artist-artworks-row:last-child {
          padding-bottom: 0;
        }

        .artist-artworks-media {
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

        .artist-artworks-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .artist-artworks-rowTitle {
          color: #1a1612;
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .artist-artworks-rowSide {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .artist-artworks-chip {
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

        .artist-artworks-chip.sage {
          background: #e7f0e8;
          color: #698d6c;
        }

        .artist-artworks-chip.ochre {
          background: #f6ecdb;
          color: #b07e24;
        }

        .artist-artworks-chip.terra {
          background: #f2e2db;
          color: #b5603a;
        }

        .artist-artworks-chip.muted {
          background: #f2ece4;
          color: #83766a;
        }

        .artist-artworks-inlineButton {
          padding: 8px 12px;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .artist-artworks-empty {
          color: #7d6e61;
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .artist-artworks-composer {
          overflow: hidden;
        }

        .artist-artworks-composerTrigger {
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

        .artist-artworks-composerTitle {
          color: #1a1612;
          font-size: 1.05rem;
          margin-bottom: 6px;
        }

        .artist-artworks-composerCopy {
          color: #7a6d62;
          font-size: 0.94rem;
          line-height: 1.6;
        }

        .artist-artworks-composerChevron {
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

        .artist-artworks-composerChevron.open {
          transform: rotate(45deg);
        }

        .artist-artworks-composerBody {
          padding: 0 22px 22px;
        }

        @media (max-width: 1080px) {
          .artist-artworks-hero {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 780px) {
          .artist-artworks-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .artist-artworks-row {
            grid-template-columns: 52px minmax(0, 1fr);
          }

          .artist-artworks-rowSide {
            grid-column: 1 / -1;
            align-items: flex-start;
            padding-left: 66px;
          }
        }

        @media (max-width: 560px) {
          .artist-artworks-stats {
            grid-template-columns: minmax(0, 1fr);
          }

          .artist-artworks-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .artist-artworks-button,
          .artist-artworks-buttonSecondary,
          .artist-artworks-linkButton,
          .artist-artworks-textButton {
            width: 100%;
          }

          .artist-artworks-panelHeader {
            flex-direction: column;
            align-items: flex-start;
          }

          .artist-artworks-composerTrigger {
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="content">
        <div className="artist-artworks-page">
          <section className="artist-artworks-hero">
            <div>
              <div className="artist-artworks-status">Portfolio</div>
              <h1 className="artist-artworks-title">My artworks</h1>
              <p className="artist-artworks-copy">
                This page stays simple on purpose: a quick overview, a few previews, and clear
                buttons for uploading new work or opening the full management page.
              </p>

              <div className="artist-artworks-actions">
                <button
                  type="button"
                  className="artist-artworks-button"
                  onClick={() => {
                    setOpenPortfolioPanel(true);
                    scrollToPanel("artist-artworks-portfolio-panel");
                  }}
                >
                  Add Showcase Work
                </button>
                <button
                  type="button"
                  className="artist-artworks-buttonSecondary"
                  onClick={() => {
                    setOpenSubmissionPanel(true);
                    scrollToPanel("artist-artworks-submission-panel");
                  }}
                >
                  Submit for Review
                </button>
                <Link href={manageArtworksHref} className="artist-artworks-linkButton">
                  View All Artworks
                </Link>
                <Link href={publicProfileHref} className="artist-artworks-linkButton">
                  Public Page
                </Link>
              </div>
            </div>

            <div className="artist-artworks-guide">
              <div className="artist-artworks-kicker">How to use this page</div>
              <h2 className="artist-artworks-guideTitle">Keep public work and review work separate.</h2>
              <p className="artist-artworks-guideCopy">
                Public portfolio items are for visitors. Submissions are for Studio 201 review. The
                separate management page is where you edit, delete, or clean up older items.
              </p>

              <div className="artist-artworks-guideList">
                <div className="artist-artworks-guideItem">
                  <div>
                    <strong>{publicCount}</strong> artwork{publicCount === 1 ? "" : "s"} visible on your public page.
                  </div>
                </div>
                <div className="artist-artworks-guideItem">
                  <div>
                    <strong>{pendingCount}</strong> submission{pendingCount === 1 ? "" : "s"} waiting for review.
                  </div>
                </div>
                <div className="artist-artworks-guideItem">
                  <div>
                    <strong>{approvedCount}</strong> submission{approvedCount === 1 ? "" : "s"} already approved.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="artist-artworks-stats">
            <StatCard
              label="Portfolio"
              value={portfolioLoading ? "..." : portfolioItems.length}
              note={`${publicCount} visible on your public page`}
            />
            <StatCard
              label="Public"
              value={portfolioLoading ? "..." : publicCount}
              note={publicCount > 0 ? "Visible to visitors" : "Nothing public yet"}
            />
            <StatCard
              label="Submitted"
              value={submissionsLoading ? "..." : submissions.length}
              note="Sent to curators"
            />
            <StatCard
              label="Approved"
              value={submissionsLoading ? "..." : approvedCount}
              note={approvedCount > 0 ? "Ready for exhibition use" : "No approved works yet"}
            />
          </section>

          <div className="artist-artworks-grid">
            <section className="artist-artworks-panel">
              <div className="artist-artworks-panelHeader">
                <div>
                  <div className="artist-artworks-kicker">Public portfolio</div>
                  <h2 className="artist-artworks-sectionTitle">Showcase preview</h2>
                </div>
                <Link href={manageArtworksHref} className="artist-artworks-textButton">
                  Manage portfolio
                </Link>
              </div>

              {portfolioLoading ? (
                <div className="artist-artworks-empty">Loading your portfolio...</div>
              ) : recentPortfolio.length === 0 ? (
                <div className="artist-artworks-empty">
                  You do not have showcase artworks yet. Add one or two strong pieces first, then
                  manage visibility from the full artworks page.
                </div>
              ) : (
                <div className="artist-artworks-list">
                  {recentPortfolio.map((item) => (
                    <div className="artist-artworks-row" key={item.id}>
                      <div className="artist-artworks-media">
                        {item.mediaAssetUrl ? <img src={item.mediaAssetUrl} alt={item.title} /> : "Work"}
                      </div>
                      <div>
                        <div className="artist-artworks-rowTitle">{item.title}</div>
                        <div className="artist-artworks-rowMeta">
                          {buildPortfolioMeta(item) || "Portfolio artwork"}
                        </div>
                      </div>
                      <div className="artist-artworks-rowSide">
                        <span className={`artist-artworks-chip ${item.isPublic ? "sage" : "muted"}`}>
                          {item.isPublic ? "Public" : "Private"}
                        </span>
                        <Link href={manageArtworksHref} className="artist-artworks-inlineButton">
                          Manage
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="artist-artworks-panel">
              <div className="artist-artworks-panelHeader">
                <div>
                  <div className="artist-artworks-kicker">Curator review</div>
                  <h2 className="artist-artworks-sectionTitle">Recent submissions</h2>
                </div>
                <Link href={manageArtworksHref} className="artist-artworks-textButton">
                  Manage submissions
                </Link>
              </div>

              {submissionsLoading ? (
                <div className="artist-artworks-empty">Loading your submissions...</div>
              ) : recentSubmissions.length === 0 ? (
                <div className="artist-artworks-empty">
                  No submissions yet. Use the review form below when you want Studio 201 to
                  consider a work for exhibition.
                </div>
              ) : (
                <div className="artist-artworks-list">
                  {recentSubmissions.map((item) => (
                    <div className="artist-artworks-row" key={item.id}>
                      <div className="artist-artworks-media">
                        {item.mediaAssetUrl ? <img src={item.mediaAssetUrl} alt={item.title} /> : "Art"}
                      </div>
                      <div>
                        <div className="artist-artworks-rowTitle">{item.title}</div>
                        <div className="artist-artworks-rowMeta">
                          {buildSubmissionMeta(item) || "Artwork submission"}
                        </div>
                      </div>
                      <div className="artist-artworks-rowSide">
                        <span className={`artist-artworks-chip ${getSubmissionTone(item.status)}`}>
                          {item.status}
                        </span>
                        <Link href={manageArtworksHref} className="artist-artworks-inlineButton">
                          Manage
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="artist-artworks-composer" id="artist-artworks-portfolio-panel">
              <button
                type="button"
                className="artist-artworks-composerTrigger"
                onClick={() => setOpenPortfolioPanel((current) => !current)}
                aria-expanded={openPortfolioPanel}
              >
                <div>
                  <div className="artist-artworks-composerTitle">Add showcase artwork</div>
                  <div className="artist-artworks-composerCopy">
                    Upload work that should appear on your public artist page.
                  </div>
                </div>
                <div className={`artist-artworks-composerChevron ${openPortfolioPanel ? "open" : ""}`}>
                  +
                </div>
              </button>

              {openPortfolioPanel ? (
                <div className="artist-artworks-composerBody">
                  <PortfolioForm
                    token={session.access_token}
                    artistId={profile.id}
                    authUserId={session.user.id}
                    onSuccess={fetchPortfolio}
                  />
                </div>
              ) : null}
            </section>

            <section className="artist-artworks-composer" id="artist-artworks-submission-panel">
              <button
                type="button"
                className="artist-artworks-composerTrigger"
                onClick={() => setOpenSubmissionPanel((current) => !current)}
                aria-expanded={openSubmissionPanel}
              >
                <div>
                  <div className="artist-artworks-composerTitle">Submit artwork for review</div>
                  <div className="artist-artworks-composerCopy">
                    Use this form when you want Studio 201 to review a work for exhibition.
                  </div>
                </div>
                <div className={`artist-artworks-composerChevron ${openSubmissionPanel ? "open" : ""}`}>
                  +
                </div>
              </button>

              {openSubmissionPanel ? (
                <div className="artist-artworks-composerBody">
                  <SubmissionForm
                    token={session.access_token}
                    artistId={profile.id}
                    onSuccess={fetchSubmissions}
                  />
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
