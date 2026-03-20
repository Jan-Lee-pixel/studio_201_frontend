"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

type NoticeTone = "success" | "error";

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
    `Submitted ${formatShortDate(item.createdAt)}`,
    detail ? `${detail.slice(0, 96)}${detail.length > 96 ? "..." : ""}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function buildPortfolioMeta(item: PortfolioItem) {
  return [item.category, item.year, item.medium, item.dimensions].filter(Boolean).join(" · ");
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
    <div className="artist-manage-statCard">
      <div className="artist-manage-statLabel">{label}</div>
      <div className="artist-manage-statValue">{value}</div>
      <div className="artist-manage-statNote">{note}</div>
    </div>
  );
}

export default function ArtistArtworksManagePage() {
  const { profile, session, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: NoticeTone; message: string } | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<ArtworkSubmission | null>(null);
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
        nextValue ? "Artwork is now visible on your public profile." : "Artwork is now private.",
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

  const handleStartEditingSubmission = (item: ArtworkSubmission) => {
    if (item.status !== "Pending") return;
    setEditingSubmission(item);
    setNotice(null);
    window.setTimeout(() => {
      document.getElementById("artist-manage-edit-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleDeleteSubmission = async (item: ArtworkSubmission) => {
    if (!session?.access_token) return;

    const confirmed = window.confirm(`Delete "${item.title}" from your submissions?`);
    if (!confirmed) return;

    const snapshot = submissions;
    setSubmissions((prev) => prev.filter((submission) => submission.id !== item.id));
    if (editingSubmission?.id === item.id) {
      setEditingSubmission(null);
    }

    try {
      await artworkSubmissionService.deleteSubmission(item.id, session.access_token);
      setNoticeMessage("Submission removed.", "success");
    } catch (error) {
      console.error("Failed to delete submission:", error);
      setSubmissions(snapshot);
      setNoticeMessage("Failed to delete submission. Approved works stay locked.", "error");
    }
  };

  const handleSubmissionUpdated = async () => {
    await fetchSubmissions();
    setEditingSubmission(null);
    setNoticeMessage("Pending submission updated.", "success");
  };

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
  const approvedCount = submissions.filter((item) => item.status === "Approved").length;
  const pendingCount = submissions.filter((item) => item.status === "Pending").length;
  const publicCount = portfolioItems.filter((item) => item.isPublic).length;

  return (
    <>
      <style jsx global>{`
        .artist-manage-page {
          padding: clamp(16px, 3vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .artist-manage-hero,
        .artist-manage-panel {
          background: #fffdfa;
          border: 1px solid #ddd5ca;
          border-radius: 24px;
          box-shadow: 0 12px 28px rgba(42, 28, 16, 0.04);
        }

        .artist-manage-hero,
        .artist-manage-panel {
          padding: 22px;
        }

        .artist-manage-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.95fr);
          gap: 22px;
        }

        .artist-manage-kicker {
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
          margin-bottom: 12px;
        }

        .artist-manage-title,
        .artist-manage-sectionTitle {
          font-family: var(--serif);
          color: #1a1612;
          margin: 0;
        }

        .artist-manage-title {
          font-size: clamp(2.1rem, 4vw, 3.2rem);
          line-height: 0.98;
        }

        .artist-manage-copy,
        .artist-manage-summaryCopy,
        .artist-manage-rowMeta,
        .artist-manage-profileValue,
        .artist-manage-empty {
          color: #75685c;
          line-height: 1.7;
        }

        .artist-manage-copy {
          margin-top: 14px;
          font-size: 1rem;
          max-width: 620px;
        }

        .artist-manage-actions,
        .artist-manage-rowActions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .artist-manage-actions {
          margin-top: 22px;
        }

        .artist-manage-button,
        .artist-manage-buttonSecondary,
        .artist-manage-linkButton,
        .artist-manage-inlineButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 16px;
          border-radius: 999px;
          border: 1px solid #ddd5ca;
          background: #fffaf4;
          color: #1a1612;
          text-decoration: none;
          font-family: inherit;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }

        .artist-manage-button {
          background: #1a1612;
          color: #fffdfa;
          border-color: #1a1612;
        }

        .artist-manage-button:hover,
        .artist-manage-buttonSecondary:hover,
        .artist-manage-linkButton:hover,
        .artist-manage-inlineButton:hover {
          transform: translateY(-1px);
        }

        .artist-manage-summary {
          background: #f9f4eb;
          border: 1px solid #ebe2d6;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .artist-manage-summaryTitle {
          font-family: var(--serif);
          font-size: 1.45rem;
          color: #1a1612;
          margin: 0;
        }

        .artist-manage-summaryList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .artist-manage-summaryItem {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .artist-manage-summaryItem::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 8px;
          flex-shrink: 0;
          background: #b5603a;
        }

        .artist-manage-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .artist-manage-statCard {
          background: #fffdfa;
          border: 1px solid #ddd5ca;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 22px rgba(42, 28, 16, 0.03);
        }

        .artist-manage-statLabel {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(26, 22, 18, 0.42);
          margin-bottom: 10px;
        }

        .artist-manage-statValue {
          font-family: var(--serif);
          font-size: 2rem;
          line-height: 1;
          color: #1a1612;
          margin-bottom: 8px;
        }

        .artist-manage-statNote {
          color: #78695c;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .artist-manage-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .artist-manage-panelHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .artist-manage-sectionTitle {
          font-size: 1.42rem;
        }

        .artist-manage-list {
          display: flex;
          flex-direction: column;
        }

        .artist-manage-row {
          display: grid;
          grid-template-columns: 60px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: 14px 0;
          border-top: 1px solid #eee5d9;
        }

        .artist-manage-row:first-child {
          border-top: none;
          padding-top: 0;
        }

        .artist-manage-row:last-child {
          padding-bottom: 0;
        }

        .artist-manage-media {
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

        .artist-manage-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .artist-manage-rowTitle {
          color: #1a1612;
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .artist-manage-rowSide {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .artist-manage-chip {
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

        .artist-manage-chip.sage {
          background: #e7f0e8;
          color: #698d6c;
        }

        .artist-manage-chip.ochre {
          background: #f6ecdb;
          color: #b07e24;
        }

        .artist-manage-chip.terra {
          background: #f2e2db;
          color: #b5603a;
        }

        .artist-manage-chip.muted {
          background: #f2ece4;
          color: #83766a;
        }

        .artist-manage-lockNote {
          color: #7a6d62;
          font-size: 0.85rem;
          text-align: right;
        }

        .artist-manage-notice {
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 0.92rem;
        }

        .artist-manage-notice.success {
          background: #edf6ef;
          color: #56795d;
          border: 1px solid #dceadc;
        }

        .artist-manage-notice.error {
          background: #f8ebe7;
          color: #9e4e2a;
          border: 1px solid #eed7cf;
        }

        @media (max-width: 1080px) {
          .artist-manage-hero {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 780px) {
          .artist-manage-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .artist-manage-row {
            grid-template-columns: 52px minmax(0, 1fr);
          }

          .artist-manage-rowSide {
            grid-column: 1 / -1;
            align-items: flex-start;
            padding-left: 66px;
          }

          .artist-manage-lockNote {
            text-align: left;
          }
        }

        @media (max-width: 560px) {
          .artist-manage-stats {
            grid-template-columns: minmax(0, 1fr);
          }

          .artist-manage-actions,
          .artist-manage-rowActions {
            flex-direction: column;
            align-items: stretch;
          }

          .artist-manage-button,
          .artist-manage-buttonSecondary,
          .artist-manage-linkButton,
          .artist-manage-inlineButton {
            width: 100%;
          }

          .artist-manage-panelHeader {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="content">
        <div className="artist-manage-page">
          <section className="artist-manage-hero">
            <div>
              <div className="artist-manage-kicker">Artwork management</div>
              <h1 className="artist-manage-title">Edit, hide, or clean up your artworks.</h1>
              <p className="artist-manage-copy">
                This is the focused management page for your artist portal. Pending submissions can
                be edited here, approved submissions stay locked, and portfolio items can be shown,
                hidden, or removed.
              </p>

              <div className="artist-manage-actions">
                <Link href="/artist/artworks" className="artist-manage-button">
                  Back to overview
                </Link>
                <Link href={publicProfileHref} className="artist-manage-linkButton">
                  Public Page
                </Link>
              </div>
            </div>

            <div className="artist-manage-summary">
              <div className="artist-manage-kicker">Editing rules</div>
              <h2 className="artist-manage-summaryTitle">Approved works stay locked.</h2>
              <p className="artist-manage-summaryCopy">
                Pending submissions can be updated. Approved submissions stay read-only so they match
                what the gallery already accepted.
              </p>

              <div className="artist-manage-summaryList">
                <div className="artist-manage-summaryItem">
                  <div>Use edit for pending submissions only.</div>
                </div>
                <div className="artist-manage-summaryItem">
                  <div>Use delete to remove non-approved items you no longer want here.</div>
                </div>
                <div className="artist-manage-summaryItem">
                  <div>Use show or hide to control what appears on your public page.</div>
                </div>
              </div>
            </div>
          </section>

          {notice ? <div className={`artist-manage-notice ${notice.tone}`}>{notice.message}</div> : null}

          <section className="artist-manage-stats">
            <StatCard
              label="Portfolio"
              value={portfolioLoading ? "..." : portfolioItems.length}
              note={`${publicCount} visible on your public page`}
            />
            <StatCard
              label="Submitted"
              value={submissionsLoading ? "..." : submissions.length}
              note={`${pendingCount} currently pending review`}
            />
            <StatCard
              label="Approved"
              value={submissionsLoading ? "..." : approvedCount}
              note="Locked for editing"
            />
            <StatCard
              label="Public Works"
              value={portfolioLoading ? "..." : publicCount}
              note="Shown to visitors"
            />
          </section>

          <div className="artist-manage-grid">
            <section className="artist-manage-panel" id="manage-portfolio">
              <div className="artist-manage-panelHeader">
                <div>
                  <div className="artist-manage-kicker">Public portfolio</div>
                  <h2 className="artist-manage-sectionTitle">Manage showcase works</h2>
                </div>
              </div>

              {portfolioLoading ? (
                <div className="artist-manage-empty">Loading your portfolio...</div>
              ) : portfolioItems.length === 0 ? (
                <div className="artist-manage-empty">
                  No showcase artworks yet. Add them from the overview page first.
                </div>
              ) : (
                <div className="artist-manage-list">
                  {portfolioItems.map((item) => (
                    <div className="artist-manage-row" key={item.id}>
                      <div className="artist-manage-media">
                        {item.mediaAssetUrl ? <img src={item.mediaAssetUrl} alt={item.title} /> : "Work"}
                      </div>
                      <div>
                        <div className="artist-manage-rowTitle">{item.title}</div>
                        <div className="artist-manage-rowMeta">
                          {buildPortfolioMeta(item) || "Portfolio artwork"}
                        </div>
                      </div>
                      <div className="artist-manage-rowSide">
                        <span className={`artist-manage-chip ${item.isPublic ? "sage" : "muted"}`}>
                          {item.isPublic ? "Public" : "Private"}
                        </span>
                        <div className="artist-manage-rowActions">
                          <button
                            type="button"
                            className="artist-manage-inlineButton"
                            onClick={() => void handleTogglePortfolioVisibility(item)}
                          >
                            {item.isPublic ? "Hide" : "Show"}
                          </button>
                          <button
                            type="button"
                            className="artist-manage-inlineButton"
                            onClick={() => void handleDeletePortfolioItem(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="artist-manage-panel" id="manage-submissions">
              <div className="artist-manage-panelHeader">
                <div>
                  <div className="artist-manage-kicker">Curator review</div>
                  <h2 className="artist-manage-sectionTitle">Manage submissions</h2>
                </div>
              </div>

              {submissionsLoading ? (
                <div className="artist-manage-empty">Loading your submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="artist-manage-empty">
                  No submissions yet. Submit work from the overview page when you are ready.
                </div>
              ) : (
                <div className="artist-manage-list">
                  {submissions.map((item) => {
                    const canEdit = item.status === "Pending";
                    const canDelete = item.status !== "Approved";

                    return (
                      <div className="artist-manage-row" key={item.id}>
                        <div className="artist-manage-media">
                          {item.mediaAssetUrl ? <img src={item.mediaAssetUrl} alt={item.title} /> : "Art"}
                        </div>
                        <div>
                          <div className="artist-manage-rowTitle">{item.title}</div>
                          <div className="artist-manage-rowMeta">
                            {buildSubmissionMeta(item) || "Artwork submission"}
                          </div>
                        </div>
                        <div className="artist-manage-rowSide">
                          <span className={`artist-manage-chip ${getSubmissionTone(item.status)}`}>
                            {item.status}
                          </span>

                          <div className="artist-manage-rowActions">
                            {canEdit ? (
                              <button
                                type="button"
                                className="artist-manage-inlineButton"
                                onClick={() => handleStartEditingSubmission(item)}
                              >
                                Edit
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                type="button"
                                className="artist-manage-inlineButton"
                                onClick={() => void handleDeleteSubmission(item)}
                              >
                                Delete
                              </button>
                            ) : null}
                            {item.mediaAssetUrl ? (
                              <a
                                href={item.mediaAssetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="artist-manage-inlineButton"
                              >
                                Open image
                              </a>
                            ) : null}
                          </div>

                          {!canEdit ? (
                            <div className="artist-manage-lockNote">
                              {item.status === "Approved"
                                ? "Approved submissions are locked."
                                : "Only pending submissions can be edited."}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {editingSubmission ? (
              <section className="artist-manage-panel" id="artist-manage-edit-panel">
                <div className="artist-manage-panelHeader">
                  <div>
                    <div className="artist-manage-kicker">Pending submission</div>
                    <h2 className="artist-manage-sectionTitle">Edit submission</h2>
                  </div>
                </div>

                <SubmissionForm
                  token={session.access_token}
                  artistId={profile.id}
                  submission={editingSubmission}
                  onCancel={() => setEditingSubmission(null)}
                  onSuccess={() => void handleSubmissionUpdated()}
                />
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
