'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { apiClient } from "@/lib/apiClient";
import { ArtworkSubmission } from "@/features/submissions/services/artworkSubmissionService";
import { exhibitionService, Exhibition } from "@/features/exhibitions/services/exhibitionService";
import { artistService, PublicUserProfile } from "@/features/artists/services/artistService";
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";

export default function AdminSubmissionsPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const accessToken = session?.access_token;
  const normalizedStatus = profile?.accountStatus?.toLowerCase();
  const normalizedRole = profile?.role?.toLowerCase();
  const [submissions, setSubmissions] = useState<ArtworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [artists, setArtists] = useState<PublicUserProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [exhibitionFilter, setExhibitionFilter] = useState<string>('all');
  const [artistFilter, setArtistFilter] = useState<string>('all');

  const fetchSubmissions = async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await apiClient<ArtworkSubmission[]>('/ArtworkSubmissions/all', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to fetch all submissions", error);
    } finally {
      setLoading(false);
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
    } catch (e) {
      console.error('Failed to load filter metadata', e);
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
    
    // Optimistic update
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    
    try {
      await apiClient(`/ArtworkSubmissions/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(newStatus)
      });
    } catch (e) {
      console.error("Failed to update status, reverting:", e);
      // Revert if API fails
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: currentStatus as any } : s));
    }
  };

  if (authLoading || loading) {
    return <DashboardContentSkeleton />;
  }

  if (normalizedStatus !== 'approved' || normalizedRole !== 'admin') {
    return <div className="p-8 text-red-500 font-serif">You do not have permission to view the review queue.</div>;
  }

  const filtered = submissions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (exhibitionFilter !== 'all' && s.exhibitionId !== exhibitionFilter) return false;
    if (artistFilter !== 'all' && s.artistId !== artistFilter) return false;
    return true;
  });

  const pending = filtered.filter(s => s.status === 'Pending');
  const reviewed = filtered.filter(s => s.status !== 'Pending');

  const exhibitionMap = exhibitions.reduce<Record<string, Exhibition>>((acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  }, {});

  const artistMap = artists.reduce<Record<string, PublicUserProfile>>((acc, artist) => {
    acc[artist.id] = artist;
    return acc;
  }, {});

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Submissions Queue</h1>
        <p className="page-subtitle text-gray-400">Review artwork submissions for upcoming exhibitions.</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-4 flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Exhibition</label>
            <select
              value={exhibitionFilter}
              onChange={(e) => setExhibitionFilter(e.target.value)}
              className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="all">All</option>
              {exhibitions.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">Artist</label>
            <select
              value={artistFilter}
              onChange={(e) => setArtistFilter(e.target.value)}
              className="border border-[var(--color-rule)] bg-white px-3 py-2 text-sm min-w-[200px]"
            >
              <option value="all">All</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.fullName}</option>
              ))}
            </select>
          </div>
        </section>
        <section>
          <h2 className="font-display text-2xl mb-6 flex items-center gap-3">
            Pending Review
            <span className="bg-red-500 text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </h2>
          {pending.length === 0 ? (
            <div className="border border-[var(--color-rule)] p-8 text-center bg-[var(--color-bone)] text-gray-500 font-mono text-sm">
              No pending submissions at this time.
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pending.map(sub => (
                <div key={sub.id} className="border border-[var(--color-rule)] bg-[var(--color-bone)] overflow-hidden flex flex-col group hover:border-[var(--color-sienna)] transition-colors">
                  <div className="aspect-[4/3] bg-gray-200 relative">
                    {sub.mediaAssetUrl ? (
                      <img src={sub.mediaAssetUrl} alt={sub.title} className="w-full h-full object-cover" />
                    ) : (
                      <StudioImagePlaceholder className="w-full h-full" markClassName="w-20" label="Artwork" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="font-display text-xl mb-1 truncate">{sub.title}</div>
                    <div className="font-sub italic text-gray-500 mb-3 text-sm truncate">{sub.description || 'No description provided'}</div>
                    <div className="text-xs font-mono text-gray-400 mb-4 tracking-wider uppercase">
                      Artist: {artistMap[sub.artistId]?.fullName || `${sub.artistId.substring(0, 8)}...`}
                    </div>
                    <div className="text-xs font-mono text-gray-400 mb-4 tracking-wider uppercase">
                      Exhibition: {exhibitionMap[sub.exhibitionId]?.title || `${sub.exhibitionId.substring(0, 8)}...`}
                    </div>
                    <div className="mt-auto flex gap-2">
                       <button onClick={() => handleUpdateStatus(sub.id, sub.status, 'Approved')} className="flex-1 bg-[var(--color-sienna)] text-white hover:bg-[var(--color-near-black)] transition-colors text-xs font-mono py-2 uppercase tracking-wide">Approve</button>
                       <button onClick={() => handleUpdateStatus(sub.id, sub.status, 'Rejected')} className="flex-1 border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors text-xs font-mono py-2 uppercase tracking-wide text-gray-500">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="pt-8 border-t border-[var(--color-rule)]">
            <h2 className="font-display text-2xl mb-6 text-gray-400">Reviewed Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                    <th className="pb-3 pr-4 font-normal">Artwork</th>
                    <th className="pb-3 px-4 font-normal">Artist</th>
                    <th className="pb-3 px-4 font-normal">Exhibition</th>
                    <th className="pb-3 px-4 font-normal">Status</th>
                    <th className="pb-3 px-4 font-normal">Reviewed</th>
                    <th className="pb-3 px-4 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewed.length === 0 ? (
                    <tr><td colSpan={6} className="py-6 text-center text-gray-400 italic">No reviewed submissions.</td></tr>
                  ) : (
                    reviewed.map(sub => (
                      <tr key={sub.id} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                        <td className="py-4 pr-4">
                           <div className="font-medium text-[var(--color-near-black)]">{sub.title}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                           {artistMap[sub.artistId]?.fullName || `${sub.artistId.substring(0, 8)}...`}
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                           {exhibitionMap[sub.exhibitionId]?.title || `${sub.exhibitionId.substring(0, 8)}...`}
                        </td>
                        <td className="py-4 px-4">
                           <span className={`inline-block px-2 py-1 text-xs font-mono uppercase tracking-wider rounded-sm ${sub.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                             {sub.status}
                           </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                           <div>{sub.approvedAt ? new Date(sub.approvedAt).toLocaleDateString() : '—'}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                           <button onClick={() => handleUpdateStatus(sub.id, sub.status, 'Pending')} className="hover:text-[var(--color-sienna)] underline underline-offset-2">Revert to Pending</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </section>

      </div>
    </div>
  );
}
