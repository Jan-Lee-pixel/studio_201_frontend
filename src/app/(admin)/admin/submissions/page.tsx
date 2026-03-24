'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { apiClient } from '@/lib/apiClient';
import { ArtworkSubmission } from '@/features/submissions/services/artworkSubmissionService';
import { exhibitionService, Exhibition } from '@/features/exhibitions/services/exhibitionService';
import { artistService, PublicUserProfile } from '@/features/artists/services/artistService';
import { DashboardContentSkeleton } from '@/components/ui/SkeletonPage';
import { StudioImagePlaceholder } from '@/components/ui/StudioImagePlaceholder';
import {
  WorkspaceCard,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspaceStatusPill,
} from '@/components/ui/WorkspacePrimitives';

function getStatusTone(status: string) {
  switch (status) {
    case 'Approved':
      return 'success' as const;
    case 'Pending':
      return 'warning' as const;
    case 'Rejected':
      return 'danger' as const;
    default:
      return 'neutral' as const;
  }
}

function formatStatusDate(value?: string | null) {
  if (!value) return 'Not reviewed yet';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminSubmissionsPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const accessToken = session?.access_token;
  const normalizedStatus = profile?.accountStatus?.toLowerCase();
  const normalizedRole = profile?.role?.toLowerCase();
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artists, setArtists] = useState<PublicUserProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [exhibitionFilter, setExhibitionFilter] = useState<string>('all');
  const [artistFilter, setArtistFilter] = useState<string>('all');

  const fetchSubmissions = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!accessToken) return;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await apiClient<ArtworkSubmission[]>('/ArtworkSubmissions/all', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to fetch all submissions', error);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchMeta = async () => {
    try {
      const [exhibitionData, artistData] = await Promise.all([
        exhibitionService.getAllExhibitions().catch(() => []),
        artistService.getArtists().catch(() => []),
      ]);
      setExhibitions(exhibitionData);
      setArtists(artistData);
    } catch (error) {
      console.error('Failed to load filter metadata', error);
    }
  };

  useEffect(() => {
    if (accessToken && normalizedStatus === 'approved' && normalizedRole === 'admin') {
      void fetchSubmissions();
      void fetchMeta();
    } else {
      setLoading(false);
    }
  }, [accessToken, normalizedRole, normalizedStatus]);

  const handleUpdateStatus = async (id: string, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus || !accessToken) return;

    setSubmissions((prev) => prev.map((submission) => (submission.id === id ? { ...submission, status: newStatus as ArtworkSubmission['status'] } : submission)));

    try {
      await apiClient(`/ArtworkSubmissions/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(newStatus),
      });
    } catch (error) {
      console.error('Failed to update status, reverting:', error);
      setSubmissions((prev) => prev.map((submission) => (submission.id === id ? { ...submission, status: currentStatus as ArtworkSubmission['status'] } : submission)));
    }
  };

  const exhibitionMap = useMemo(
    () =>
      exhibitions.reduce<Record<string, Exhibition>>((acc, exhibition) => {
        acc[exhibition.id] = exhibition;
        return acc;
      }, {}),
    [exhibitions],
  );

  const artistMap = useMemo(
    () =>
      artists.reduce<Record<string, PublicUserProfile>>((acc, artist) => {
        acc[artist.id] = artist;
        return acc;
      }, {}),
    [artists],
  );

  const filtered = useMemo(
    () =>
      submissions.filter((submission) => {
        if (statusFilter !== 'all' && submission.status !== statusFilter) return false;
        if (exhibitionFilter !== 'all' && submission.exhibitionId !== exhibitionFilter) return false;
        if (artistFilter !== 'all' && submission.artistId !== artistFilter) return false;
        return true;
      }),
    [artistFilter, exhibitionFilter, statusFilter, submissions],
  );

  const pending = filtered.filter((submission) => submission.status === 'Pending');
  const reviewed = filtered.filter((submission) => submission.status !== 'Pending');
  if (authLoading || loading) {
    return <DashboardContentSkeleton />;
  }

  if (normalizedStatus !== 'approved' || normalizedRole !== 'admin') {
    return <div className="p-8 font-serif text-red-500">You do not have permission to view the review queue.</div>;
  }

  const selectClassName =
    'min-h-[46px] rounded-full border border-[var(--color-rule)] bg-white px-4 py-2 text-sm text-[var(--color-near-black)] outline-none transition-colors duration-200 focus:border-[var(--color-sienna)]';

  return (
    <div className="content">
      <WorkspacePageHeader
        eyebrow="Curation Queue"
        title="Review artist submissions with a calmer, faster scanning flow."
        description="Filter the queue, review pending work, and scan past decisions."
        actions={
          <button
            type="button"
            onClick={() => void fetchSubmissions({ silent: true })}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Queue'}
          </button>
        }
      />

      <WorkspaceCard className="mb-8">
        <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Status</label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className={selectClassName}>
              <option value="all">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Exhibition</label>
            <select value={exhibitionFilter} onChange={(event) => setExhibitionFilter(event.target.value)} className={selectClassName}>
              <option value="all">All exhibitions</option>
              {exhibitions.map((exhibition) => (
                <option key={exhibition.id} value={exhibition.id}>
                  {exhibition.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Artist</label>
            <select value={artistFilter} onChange={(event) => setArtistFilter(event.target.value)} className={selectClassName}>
              <option value="all">All artists</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.fullName}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setExhibitionFilter('all');
              setArtistFilter('all');
            }}
            className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-bone)] px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-white"
          >
            Clear Filters
          </button>
        </div>
      </WorkspaceCard>

      <div className="space-y-10">
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-display text-[34px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                Pending Review
              </div>
            </div>
            <WorkspaceStatusPill tone="warning">{pending.length} waiting</WorkspaceStatusPill>
          </div>

          {pending.length === 0 ? (
            <WorkspaceEmptyState
              title="No pending submissions"
              description="There is nothing waiting for review with the current filters. Clear the filters or come back when artists submit new work."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {pending.map((submission) => {
                const artistName = artistMap[submission.artistId]?.fullName || 'Artist unavailable';
                const exhibitionName = exhibitionMap[submission.exhibitionId]?.title || 'Exhibition unavailable';
                const summary = submission.description?.trim()
                  ? `${submission.description.slice(0, 140)}${submission.description.length > 140 ? '...' : ''}`
                  : 'No description provided.';

                return (
                  <WorkspaceCard key={submission.id} className="overflow-hidden p-0">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bone)]">
                      {submission.mediaAssetUrl ? (
                        <img src={submission.mediaAssetUrl} alt={submission.title} className="h-full w-full object-cover" />
                      ) : (
                        <StudioImagePlaceholder className="h-full w-full" markClassName="w-16" label="Artwork" />
                      )}
                      <div className="absolute left-4 top-4">
                        <WorkspaceStatusPill tone={getStatusTone(submission.status)}>{submission.status}</WorkspaceStatusPill>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div>
                        <h3 className="font-display text-[28px] leading-[0.96] tracking-[-0.04em] text-[var(--color-near-black)]">
                          {submission.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--color-warm-slate)]">{summary}</p>
                      </div>

                      <div className="grid gap-3 rounded-[20px] border border-[var(--color-rule)] bg-[var(--color-bone)] p-4">
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Artist</div>
                          <div className="mt-1 text-sm text-[var(--color-near-black)]">{artistName}</div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Exhibition</div>
                          <div className="mt-1 text-sm text-[var(--color-near-black)]">{exhibitionName}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(submission.id, submission.status, 'Approved')}
                          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-4 text-xs uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)]"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(submission.id, submission.status, 'Rejected')}
                          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[rgba(181,96,58,0.2)] bg-[rgba(181,96,58,0.08)] px-4 text-xs uppercase tracking-[0.12em] text-[#9f4c2d] transition-colors duration-200 hover:bg-[rgba(181,96,58,0.14)]"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </WorkspaceCard>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-display text-[34px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                Reviewed Items
              </div>
            </div>
            <WorkspaceStatusPill tone="neutral">{reviewed.length} reviewed</WorkspaceStatusPill>
          </div>

          <WorkspaceCard>
            {reviewed.length === 0 ? (
              <div className="p-8">
                <WorkspaceEmptyState
                  title="No reviewed items"
                  description="Approved and rejected submissions will appear here. The reviewed section stays lightweight until the queue fills up."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-rule)] bg-[var(--color-bone)] text-left">
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Artwork</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Artist</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Exhibition</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Status</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Reviewed</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewed.map((submission) => (
                      <tr key={submission.id} className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-[rgba(250,248,244,0.7)]">
                        <td className="px-6 py-5">
                          <div className="font-display text-[24px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                            {submission.title}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[var(--color-warm-slate)]">
                          {artistMap[submission.artistId]?.fullName || 'Artist unavailable'}
                        </td>
                        <td className="px-6 py-5 text-sm text-[var(--color-warm-slate)]">
                          {exhibitionMap[submission.exhibitionId]?.title || 'Exhibition unavailable'}
                        </td>
                        <td className="px-6 py-5">
                          <WorkspaceStatusPill tone={getStatusTone(submission.status)}>{submission.status}</WorkspaceStatusPill>
                        </td>
                        <td className="px-6 py-5 text-sm text-[var(--color-warm-slate)]">{formatStatusDate(submission.approvedAt)}</td>
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(submission.id, submission.status, 'Pending')}
                            className="text-xs uppercase tracking-[0.12em] text-[var(--color-sienna)] underline underline-offset-4"
                          >
                            Revert to Pending
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </WorkspaceCard>
        </section>
      </div>
    </div>
  );
}
