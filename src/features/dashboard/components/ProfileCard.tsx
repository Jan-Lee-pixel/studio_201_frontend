import Link from "next/link";
import { UserProfile } from "@/features/auth/services/authService";
import { ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";

interface ProfileCardProps {
  profile: UserProfile;
  submissions: ArtworkSubmission[];
  loading: boolean;
}

export function ProfileCard({ profile, submissions, loading }: ProfileCardProps) {
  const totalWorks = submissions.length;
  const pendingWorks = submissions.filter((s) => s.status === "Pending").length;
  const approvedWorks = submissions.filter((s) => s.status === "Approved").length;

  return (
    <div className="card">
      <div className="profile-block">
        <div className="profile-avatar-lg">
          {profile.fullName.charAt(0).toUpperCase()}
          <div className="profile-avatar-edit">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 1l2 2L3 9H1V7L7 1z" />
            </svg>
          </div>
        </div>
        <p className="profile-name">{profile.fullName}</p>
        <p className="profile-handle">@{profile.fullName.toLowerCase().replace(/\s/g, "")} · {profile.role}</p>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">{loading ? "—" : totalWorks}</span>
            <span className="profile-stat-label">Works</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{loading ? "—" : approvedWorks}</span>
            <span className="profile-stat-label">Approved</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">{loading ? "—" : pendingWorks}</span>
            <span className="profile-stat-label">Pending</span>
          </div>
        </div>
      </div>
      
      <div className="info-list">
        <div className="info-item">
          <span className="info-label">Email</span>
          <span className="info-value">
            <Link href={`mailto:${profile.email}`}>{profile.email}</Link>
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Member Since</span>
          <span className="info-value">
            {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Role</span>
          <span className="info-value" style={{ textTransform: "capitalize" }}>{profile.role}</span>
        </div>
      </div>
      
      <div className="card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="#" className="btn btn-secondary btn-sm">Edit Profile</Link>
        <Link href="#" className="btn btn-secondary btn-sm">Public Page →</Link>
      </div>
    </div>
  );
}
