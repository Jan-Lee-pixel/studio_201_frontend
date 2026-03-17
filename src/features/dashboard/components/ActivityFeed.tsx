import { ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";
import { Skeleton } from "@/components/ui/Skeleton";

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
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="activity-item">
                <Skeleton className="skeleton-circle w-2.5 h-2.5" />
                <Skeleton className="skeleton-line w-48" />
                <Skeleton className="skeleton-line w-16" />
              </div>
            ))}
          </div>
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
