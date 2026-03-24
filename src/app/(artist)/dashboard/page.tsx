"use client";

export const dynamic = "force-dynamic";

import { type ReactNode, useEffect, useState } from "react";
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
import {
  WorkspaceCard,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspaceStatusPill,
} from "@/components/ui/WorkspacePrimitives";

type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger";
type ActionTone = "primary" | "secondary" | "subtle";

const primaryActionClass =
  "inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)]";
const secondaryActionClass =
  "inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]";
const subtleActionClass =
  "inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-bone)] px-4 text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-white";

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

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getStatusTone(status: string): StatusTone {
  const normalized = status.toLowerCase();
  if (normalized === "approved" || normalized === "public") return "success";
  if (normalized === "pending") return "warning";
  if (normalized === "rejected") return "danger";
  if (normalized === "private") return "neutral";
  return "accent";
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

function DashboardActionLink({
  href,
  children,
  tone = "secondary",
}: {
  href: string;
  children: ReactNode;
  tone?: ActionTone;
}) {
  const className =
    tone === "primary"
      ? primaryActionClass
      : tone === "subtle"
        ? subtleActionClass
        : secondaryActionClass;

  return (
    <PortalLink href={href} className={className}>
      {children}
    </PortalLink>
  );
}

function DashboardListItem({
  title,
  meta,
  imageUrl,
  placeholderLabel,
  statusLabel,
  statusTone,
  actionHref,
}: {
  title: string;
  meta: string;
  imageUrl?: string | null;
  placeholderLabel: string;
  statusLabel: string;
  statusTone: StatusTone;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-[var(--color-rule)] py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[18px] border border-[var(--color-rule)] bg-[var(--color-bone)]">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <StudioImagePlaceholder className="h-full w-full" markClassName="w-8" label={placeholderLabel} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-display text-[28px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
          {title}
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--color-warm-slate)]">{meta || "Artwork details"}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
        <WorkspaceStatusPill tone={statusTone}>{statusLabel}</WorkspaceStatusPill>
        <DashboardActionLink href={actionHref} tone="subtle">
          Manage
        </DashboardActionLink>
      </div>
    </div>
  );
}

function DashboardComposer({
  id,
  title,
  description,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <WorkspaceCard tone="muted" id={id}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 p-6 text-left"
      >
        <div>
          <div className="font-display text-[30px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
            {title}
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--color-warm-slate)]">{description}</p>
        </div>

        <div
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-rule)] bg-white text-[24px] leading-none text-[var(--color-warm-slate)] transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </div>
      </button>

      {open ? <div className="border-t border-[var(--color-rule)] bg-white/70 p-4 sm:p-6">{children}</div> : null}
    </WorkspaceCard>
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
      <div className="p-8 font-mono text-sm text-red-500">
        User profile not found. Please log in again.
      </div>
    );
  }

  const slug = profile.slug?.trim() || slugify(profile.fullName);
  const publicProfileHref = slug ? `/artists/${slug}` : "/artists";
  const manageArtworksHref = "/artist/artworks/manage";
  const orderedSubmissions = [...submissions].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const orderedPortfolio = [...portfolioItems].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const recentSubmissions = orderedSubmissions.slice(0, 3);
  const recentPortfolio = orderedPortfolio.slice(0, 3);
  const pendingCount = submissions.filter((item) => item.status === "Pending").length;
  const publicPortfolioCount = portfolioItems.filter((item) => item.isPublic).length;
  const readyForPublicProfile = Boolean(profile.bio?.trim()) && publicPortfolioCount > 0;
  const nextStep =
    submissions.length === 0
      ? "Submit your first artwork for review."
      : publicPortfolioCount === 0
        ? "Add one strong piece to your public portfolio."
        : "Keep your public profile and artwork selection current.";
  const profileImage = profile.profileImageUrl;
  const profileSummary =
    profile.bio?.trim() ||
    "Add a short biography so visitors understand the work before they start scrolling through images.";
  const accountStatusTone = getStatusTone(profile.accountStatus);
  const accountStatusLabel = formatLabel(profile.accountStatus);

  const scrollToPanel = (panelId: string) => {
    window.setTimeout(() => {
      document.getElementById(panelId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  return (
    <div className="content">
      <WorkspacePageHeader
        eyebrow="Artist Dashboard"
        title="Keep submissions, public works, and profile signals in one calmer workspace."
        description="Review submissions, manage public works, and keep your profile current."
        actions={
          <>
            <button
              type="button"
              className={primaryActionClass}
              onClick={() => {
                setOpenSubmissionPanel(true);
                scrollToPanel("artist-dashboard-submission-panel");
              }}
            >
              Submit Artwork
            </button>
            <button
              type="button"
              className={secondaryActionClass}
              onClick={() => {
                setOpenPortfolioPanel(true);
                scrollToPanel("artist-dashboard-portfolio-panel");
              }}
            >
              Add Public Work
            </button>
            <DashboardActionLink href={manageArtworksHref}>Manage Artworks</DashboardActionLink>
            <DashboardActionLink href={publicProfileHref}>Public Page</DashboardActionLink>
          </>
        }
      />

      <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <WorkspaceCard tone="charcoal">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <WorkspaceStatusPill tone={accountStatusTone}>{accountStatusLabel} account</WorkspaceStatusPill>
              <WorkspaceStatusPill tone={readyForPublicProfile ? "success" : "warning"}>
                {readyForPublicProfile ? "Profile ready to share" : "Profile still incomplete"}
              </WorkspaceStatusPill>
            </div>

            <h2 className="mt-6 font-display text-[clamp(38px,5vw,66px)] leading-[0.9] tracking-[-0.06em] text-[var(--color-cream)]">
              Welcome back,
              <br />
              {profile.fullName}
            </h2>

            <p className="mt-6 max-w-[58ch] text-[15px] leading-8 text-[rgba(240,237,229,0.74)]">
              The page now centers the three things that matter most: what is in review, what is already public, and what still needs attention before visitors see the work.
            </p>

            <div className="mt-8 rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.56)]">
                Next step
              </div>
              <div className="mt-3 font-sub text-[24px] italic leading-[1.45] text-[var(--color-cream)]">
                {nextStep}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.5)]">
                    In review
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[rgba(240,237,229,0.76)]">
                    {pendingCount} submission{pendingCount === 1 ? "" : "s"} waiting for curator feedback.
                  </div>
                </div>
                <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.5)]">
                    Public works
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[rgba(240,237,229,0.76)]">
                    {publicPortfolioCount} artwork{publicPortfolioCount === 1 ? "" : "s"} visible on your artist page.
                  </div>
                </div>
                <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.5)]">
                    Profile health
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[rgba(240,237,229,0.76)]">
                    {readyForPublicProfile ? "Your page has the basics covered." : "Add a bio and public work to finish the essentials."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </WorkspaceCard>

      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-6">
          <WorkspaceCard>
            <div className="p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                    Recent reviews
                  </div>
                  <h2 className="mt-3 font-display text-[34px] leading-[0.95] tracking-[-0.04em] text-[var(--color-near-black)]">
                    Latest submissions
                  </h2>
                </div>
                <DashboardActionLink href={manageArtworksHref} tone="subtle">
                  Manage All
                </DashboardActionLink>
              </div>

              <div className="mt-6">
                {submissionsLoading ? (
                  <div className="text-sm leading-6 text-[var(--color-warm-slate)]">Loading your submissions...</div>
                ) : recentSubmissions.length === 0 ? (
                  <WorkspaceEmptyState
                    title="No submissions yet"
                    description="Use the main action above to send your first artwork for review."
                  />
                ) : (
                  recentSubmissions.map((item) => (
                    <DashboardListItem
                      key={item.id}
                      title={item.title}
                      meta={buildSubmissionMeta(item) || "Artwork submission"}
                      imageUrl={item.mediaAssetUrl}
                      placeholderLabel="Art"
                      statusLabel={item.status}
                      statusTone={getStatusTone(item.status)}
                      actionHref={manageArtworksHref}
                    />
                  ))
                )}
              </div>
            </div>
          </WorkspaceCard>

          <WorkspaceCard>
            <div className="p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                    Public portfolio
                  </div>
                  <h2 className="mt-3 font-display text-[34px] leading-[0.95] tracking-[-0.04em] text-[var(--color-near-black)]">
                    Showcase preview
                  </h2>
                </div>
                <DashboardActionLink href={manageArtworksHref} tone="subtle">
                  View All Artworks
                </DashboardActionLink>
              </div>

              <div className="mt-6">
                {portfolioLoading ? (
                  <div className="text-sm leading-6 text-[var(--color-warm-slate)]">Loading your public artworks...</div>
                ) : recentPortfolio.length === 0 ? (
                  <WorkspaceEmptyState
                    title="Your public portfolio is empty"
                    description="Add one or two strong works so visitors see something credible right away."
                  />
                ) : (
                  recentPortfolio.map((item) => (
                    <DashboardListItem
                      key={item.id}
                      title={item.title}
                      meta={buildPortfolioMeta(item) || "Portfolio artwork"}
                      imageUrl={item.mediaAssetUrl}
                      placeholderLabel="Work"
                      statusLabel={item.isPublic ? "Public" : "Private"}
                      statusTone={getStatusTone(item.isPublic ? "public" : "private")}
                      actionHref={manageArtworksHref}
                    />
                  ))
                )}
              </div>
            </div>
          </WorkspaceCard>

          <DashboardComposer
            id="artist-dashboard-submission-panel"
            title="Submit new artwork"
            description="Send a work to Studio 201 for review."
            open={openSubmissionPanel}
            onToggle={() => setOpenSubmissionPanel((current) => !current)}
          >
            <SubmissionForm
              token={session.access_token}
              artistId={profile.id}
              onSuccess={fetchSubmissions}
            />
          </DashboardComposer>

          <DashboardComposer
            id="artist-dashboard-portfolio-panel"
            title="Add showcase artwork"
            description="Add a work to your public artist page."
            open={openPortfolioPanel}
            onToggle={() => setOpenPortfolioPanel((current) => !current)}
          >
            <PortfolioForm
              token={session.access_token}
              artistId={profile.id}
              authUserId={session.user.id}
              onSuccess={fetchPortfolio}
            />
          </DashboardComposer>
        </div>

        <div className="space-y-6">
          <WorkspaceCard>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[var(--color-rule)] bg-[var(--color-bone)]">
                  {profileImage ? (
                    <img src={profileImage} alt={profile.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <StudioImagePlaceholder className="h-full w-full rounded-full" markClassName="w-8" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-[34px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
                    {profile.fullName}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    @{slug || "artist"} · {profile.role ?? accountStatusLabel}
                  </div>
                </div>
              </div>

              <p className="mt-6 text-sm leading-7 text-[var(--color-warm-slate)]">{profileSummary}</p>

              <div className="mt-6 space-y-4">
                <div className="border-t border-[var(--color-rule)] pt-4 first:border-t-0 first:pt-0">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    Email
                  </div>
                  <a href={`mailto:${profile.email}`} className="mt-2 block text-sm text-[var(--color-near-black)]">
                    {profile.email}
                  </a>
                </div>
                <div className="border-t border-[var(--color-rule)] pt-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    Member since
                  </div>
                  <div className="mt-2 text-sm text-[var(--color-near-black)]">{formatLongMonth(profile.createdAt)}</div>
                </div>
                <div className="border-t border-[var(--color-rule)] pt-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    Public page
                  </div>
                  <a href={publicProfileHref} className="mt-2 block text-sm text-[var(--color-near-black)]">
                    Open artist page
                  </a>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <DashboardActionLink href="/artist/profile" tone="subtle">
                  Edit Profile
                </DashboardActionLink>
                <DashboardActionLink href={publicProfileHref} tone="subtle">
                  Public Page
                </DashboardActionLink>
              </div>
            </div>
          </WorkspaceCard>

          <WorkspaceCard tone="muted">
            <div className="p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                Readiness
              </div>
              <h2 className="mt-3 font-display text-[34px] leading-[0.95] tracking-[-0.04em] text-[var(--color-near-black)]">
                Make the public page feel alive.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-warm-slate)]">
                A short bio and one strong public artwork are the minimum. Everything else is refinement.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[20px] border border-[var(--color-rule)] bg-white/80 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    Bio
                  </div>
                  <div className="mt-2">
                    <WorkspaceStatusPill tone={profile.bio?.trim() ? "success" : "warning"}>
                      {profile.bio?.trim() ? "Added" : "Still missing"}
                    </WorkspaceStatusPill>
                  </div>
                </div>
                <div className="rounded-[20px] border border-[var(--color-rule)] bg-white/80 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                    Public artworks
                  </div>
                  <div className="mt-2">
                    <WorkspaceStatusPill tone={publicPortfolioCount > 0 ? "success" : "warning"}>
                      {publicPortfolioCount > 0 ? `${publicPortfolioCount} visible` : "None visible yet"}
                    </WorkspaceStatusPill>
                  </div>
                </div>
              </div>
            </div>
          </WorkspaceCard>
        </div>
      </div>
    </div>
  );
}
