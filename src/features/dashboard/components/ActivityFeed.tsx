import { ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";

interface ActivityFeedProps {
  submissions: ArtworkSubmission[];
  loading: boolean;
}

export function ActivityFeed({ submissions, loading }: ActivityFeedProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Activity</h2>
      </div>
      <div className="activity-feed">
        {loading ? (
          <p className="p-4 text-sm text-gray-400 font-dm-mono">Loading…</p>
        ) : submissions.length === 0 ? (
          <p className="p-4 text-sm" style={{ color: "var(--warm-mid)" }}>
            No activity yet. Submit your first artwork!
          </p>
        ) : (
          submissions.slice(0, 5).map((art) => (
            <div className="activity-item" key={art.id}>
              <div className={`activity-dot ${art.status === "Approved" ? "green" : art.status === "Pending" ? "orange" : ""}`}></div>
              <div className="activity-text">
                <strong>{art.title}</strong>{" "}
                {art.status === "Approved" ? "approved by curators" : art.status === "Rejected" ? "was not selected" : "submitted for review"}
              </div>
              <span className="activity-time">
                {new Date(art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
