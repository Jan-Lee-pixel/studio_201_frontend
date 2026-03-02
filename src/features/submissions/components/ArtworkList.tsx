import Link from "next/link";
import { ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";

const STATUS_CLASS: Record<string, string> = {
  Approved: "status-approved",
  Pending:  "status-pending",
  Rejected: "status-draft",
};

interface ArtworkListProps {
  submissions: ArtworkSubmission[];
  loading: boolean;
}

export function ArtworkList({ submissions, loading }: ArtworkListProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Your Artworks</h2>
        <Link href="#" className="btn btn-secondary btn-sm">View All →</Link>
      </div>
      <div className="artwork-list">
        {loading ? (
          <p className="p-4 text-sm text-gray-400 font-dm-mono">Loading artworks…</p>
        ) : submissions.length === 0 ? (
          <div className="p-6 text-center" style={{ color: "var(--warm-mid)", fontSize: "12px" }}>
            <p>No artworks submitted yet.</p>
            <p style={{ marginTop: "6px" }}>Use the form below to make your first submission!</p>
          </div>
        ) : (
          submissions.map((art) => (
            <div className="artwork-row" key={art.id}>
              <div className="artwork-thumb">
                <div 
                  className="artwork-thumb-gradient" 
                  style={{ background: "linear-gradient(135deg, var(--warm-sand), var(--terracotta))" }}
                ></div>
              </div>
              <div className="artwork-info">
                <p className="artwork-title">{art.title}</p>
                <p className="artwork-meta">
                  {art.description ? art.description.slice(0, 60) + (art.description.length > 60 ? "…" : "") : "No description"}
                  {" · "}
                  {new Date(art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <span className={`artwork-status ${STATUS_CLASS[art.status] ?? "status-draft"}`}>
                {art.status}
              </span>
              <div className="artwork-actions">
                <button className="action-btn" title="Edit">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" />
                  </svg>
                </button>
                <button className="action-btn" title="View">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z"/>
                    <circle cx="6" cy="6" r="1.5"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
