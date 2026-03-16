"use client";

export const dynamic = 'force-dynamic';

import { useAuth } from "@/providers/AuthProvider";
import { artworkSubmissionService, ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";
import { portfolioService, PortfolioItem } from "@/features/portfolio/services/portfolioService";
import { useState, useEffect } from "react";

// Refactored Components
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { ProfileCard } from "@/features/dashboard/components/ProfileCard";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { ArtworkList } from "@/features/submissions/components/ArtworkList";
import { SubmissionForm } from "@/features/submissions/components/SubmissionForm";
import { PortfolioForm } from "@/features/portfolio/components/PortfolioForm";
import { PortfolioList } from "@/features/portfolio/components/PortfolioList";

export default function ArtistDashboardPage() {
  const { profile, session, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

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
    } catch (error) {
      console.error("Failed to update portfolio visibility:", error);
      setPortfolioItems((prev) =>
        prev.map((portfolioItem) => (portfolioItem.id === item.id ? item : portfolioItem))
      );
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
    } catch (error) {
      console.error("Failed to delete portfolio item:", error);
      setPortfolioItems(snapshot);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-gray-500 font-dm-mono text-sm">Loading profile...</div>;
  }

  if (!profile || !session?.access_token) {
    return <div className="p-8 text-red-500 font-dm-mono text-sm">User profile not found. Please log in again.</div>;
  }

  const slug =
    profile.slug?.trim() ||
    profile.fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-header">
        <div className="status-chip">Status {profile.accountStatus}</div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Welcome back,<br /><span>{profile.fullName}</span></h1>
            <p className="page-subtitle">Manage your portfolio, submit new artworks for exhibition, and track your gallery presence.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                const target = document.getElementById("new-submission");
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <svg className="btn-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1v12M1 7h12"/></svg>
              New Submission
            </button>
            <button
              className="btn btn-terracotta"
              onClick={() => {
                window.location.href = slug ? `/artists/${slug}` : "/artists";
              }}
            >
              View Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <DashboardStats 
        submissions={submissions} 
        memberSince={new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
        loading={subsLoading} 
      />

      {/* Main grid: Left (Artworks + Form) | Right (Profile + Feed) */}
      <div className="grid-3-1">
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <ArtworkList submissions={submissions} loading={subsLoading} showViewLink />
          <PortfolioList
            items={portfolioItems}
            loading={portfolioLoading}
            onTogglePublic={handleTogglePortfolioVisibility}
            onDelete={handleDeletePortfolioItem}
          />
          
          <SubmissionForm 
            token={session.access_token} 
            artistId={profile.id}
            onSuccess={fetchSubmissions} // Refresh list on success
          />

          <PortfolioForm
            token={session.access_token}
            artistId={profile.id}
            authUserId={session.user.id}
            onSuccess={fetchPortfolio}
          />
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <ProfileCard 
            profile={profile} 
            submissions={submissions} 
            loading={subsLoading} 
          />
          
          <ActivityFeed 
            submissions={submissions} 
            loading={subsLoading} 
          />
        </div>

      </div>

      {/* Need Assistance Widget */}
      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "40px", height: "40px", background: "var(--linen)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "18px" }}>ⓘ</div>
            <div>
              <p style={{ fontFamily: "var(--serif)", fontSize: "1rem", fontWeight: 400, marginBottom: "3px" }}>Need Assistance?</p>
              <p style={{ fontSize: "11px", color: "var(--warm-mid)" }}>If you have questions about the submission process or exhibition details, our curation team is here to help.</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>Contact Gallery</button>
        </div>
      </div>
      
    </div>
  );
}
