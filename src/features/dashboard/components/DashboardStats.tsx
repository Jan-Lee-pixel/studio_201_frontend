import { ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";

interface DashboardStatsProps {
  submissions: ArtworkSubmission[];
  memberSince: string;
  loading: boolean;
}

export function DashboardStats({ submissions, memberSince, loading }: DashboardStatsProps) {
  const totalWorks = submissions.length;
  const pendingWorks = submissions.filter((s) => s.status === "Pending").length;
  const approvedWorks = submissions.filter((s) => s.status === "Approved").length;

  return (
    <div className="stats-row stats-4 mb-20">
      <div className="stat-card accent-terra">
        <div className="stat-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 11L5 7l2.5 2.5L9.5 5 12 11H2z" />
          </svg>
        </div>
        <p className="stat-label">Total Works</p>
        <p className="stat-value">{loading ? "—" : totalWorks}</p>
        <p className="stat-delta">{loading ? "" : `${approvedWorks} approved`}</p>
      </div>

      <div className="stat-card accent-ochre">
        <div className="stat-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M7 4v3l2 2" />
          </svg>
        </div>
        <p className="stat-label">Under Review</p>
        <p className="stat-value">{loading ? "—" : pendingWorks}</p>
        <p className="stat-sub">{pendingWorks > 0 ? `${pendingWorks} awaiting decision` : "None pending"}</p>
      </div>

      <div className="stat-card accent-sage">
        <div className="stat-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 10l3-4 2 2 2-3 3 5" />
          </svg>
        </div>
        <p className="stat-label">Approved</p>
        <p className="stat-value">{loading ? "—" : approvedWorks}</p>
        <p className="stat-delta">{approvedWorks > 0 ? "Ready for exhibition" : "None yet"}</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="12" height="9" rx="1" />
            <path d="M5 3V1M9 3V1M1 7h12" />
          </svg>
        </div>
        <p className="stat-label">Member Since</p>
        <p className="stat-value" style={{ fontSize: "1.5rem" }}>{memberSince}</p>
        <p className="stat-sub">Active member</p>
      </div>
    </div>
  );
}
