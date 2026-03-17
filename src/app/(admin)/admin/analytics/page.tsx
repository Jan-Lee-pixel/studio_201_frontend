'use client';

import { useEffect, useState } from 'react';
import { adminService, AdminStats } from '@/features/admin/services/adminService';
import { exhibitionService } from '@/features/exhibitions/services/exhibitionService';
import { eventService } from '@/features/events/services/eventService';
import { DashboardContentSkeleton } from "@/components/ui/SkeletonPage";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [exhibitionCount, setExhibitionCount] = useState(0);
  const [eventCounts, setEventCounts] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, exhibitions, events] = await Promise.all([
          adminService.getStats(),
          exhibitionService.getAllExhibitions().catch(() => []),
          eventService.getAllEvents().catch(() => []),
        ]);

        if (!isMounted) return;

        setStats(statsData);
        setExhibitionCount(exhibitions.length);

        const published = events.filter((event) => event.isPublished).length;
        setEventCounts({
          total: events.length,
          published,
          draft: events.length - published,
        });
      } catch (e) {
        console.error('Failed to load analytics', e);
        if (!isMounted) return;
        setError('Failed to load analytics.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle text-gray-400">Platform health and activity snapshot.</p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
          {error}
        </div>
      )}

      {loading ? (
        <DashboardContentSkeleton withWrapper={false} showHeader={false} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="border border-[var(--color-rule)] bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Pending Submissions</div>
              <div className="text-3xl font-display mt-2">{stats?.pendingSubmissions ?? 0}</div>
            </div>
            <div className="border border-[var(--color-rule)] bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Active Exhibitions</div>
              <div className="text-3xl font-display mt-2">{stats?.activeExhibitions ?? 0}</div>
            </div>
            <div className="border border-[var(--color-rule)] bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Total Users</div>
              <div className="text-3xl font-display mt-2">{stats?.totalUsers ?? 0}</div>
            </div>
            <div className="border border-[var(--color-rule)] bg-white p-6">
              <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Total Exhibitions</div>
              <div className="text-3xl font-display mt-2">{exhibitionCount}</div>
            </div>
          </div>

          <div className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Event Publishing</h2>
              <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                Total {eventCounts.total}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-[var(--color-rule)] bg-white p-4">
                <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Published</div>
                <div className="text-2xl font-display mt-2">{eventCounts.published}</div>
              </div>
              <div className="border border-[var(--color-rule)] bg-white p-4">
                <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Drafts</div>
                <div className="text-2xl font-display mt-2">{eventCounts.draft}</div>
              </div>
              <div className="border border-[var(--color-rule)] bg-white p-4">
                <div className="text-xs font-mono uppercase tracking-widest text-gray-400">Total Events</div>
                <div className="text-2xl font-display mt-2">{eventCounts.total}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
