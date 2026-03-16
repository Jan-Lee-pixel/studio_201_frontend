'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { exhibitionService, Exhibition } from '@/features/exhibitions/services/exhibitionService';

const parseDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const formatDate = (value?: string) => {
  const date = parseDate(value);
  if (!date) return 'TBA';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatus = (exhibition: Exhibition) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(exhibition.startDate);
  const end = parseDate(exhibition.endDate);

  if (start && start > today) {
    return { label: 'Upcoming', tone: 'bg-blue-100 text-blue-800' };
  }
  if (end && end < today) {
    return { label: 'Archived', tone: 'bg-gray-100 text-gray-700' };
  }
  if (!start && !end) {
    return { label: 'Draft', tone: 'bg-yellow-100 text-yellow-800' };
  }
  return { label: 'Active', tone: 'bg-green-100 text-green-800' };
};

export default function AdminExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExhibitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exhibitionService.getAllExhibitions();
      setExhibitions(data);
    } catch (e) {
      console.error('Failed to load exhibitions', e);
      setError('Failed to load exhibitions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExhibitions();
  }, []);

  const totalLabel = useMemo(() => `${exhibitions.length} total`, [exhibitions.length]);

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="page-title">Exhibitions</h1>
            <p className="page-subtitle text-gray-400">Manage current, upcoming, and archived exhibitions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary btn-sm" onClick={loadExhibitions}>
              Refresh
            </button>
            <Link href="/admin/exhibitions/new" className="btn btn-terracotta btn-sm">
              + New Exhibition
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 font-dm-mono text-sm uppercase tracking-widest">Loading exhibitions...</div>
      ) : (
        <div className="border border-[var(--color-rule)] bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)]">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">{totalLabel}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                  <th className="pb-3 pt-4 px-6 font-normal">Title</th>
                  <th className="pb-3 pt-4 px-6 font-normal">Dates</th>
                  <th className="pb-3 pt-4 px-6 font-normal">Status</th>
                  <th className="pb-3 pt-4 px-6 font-normal">Public</th>
                </tr>
              </thead>
              <tbody>
                {exhibitions.length === 0 ? (
                  <tr>
                    <td className="py-8 px-6 text-gray-500" colSpan={4}>
                      No exhibitions yet. Create the first one to get started.
                    </td>
                  </tr>
                ) : (
                  exhibitions.map((exhibition) => {
                    const status = getStatus(exhibition);
                    return (
                      <tr key={exhibition.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 px-6">
                          <div className="font-medium text-[var(--color-near-black)]">{exhibition.title}</div>
                          <div className="text-xs text-gray-400">{exhibition.slug}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-500">
                          {formatDate(exhibition.startDate)} – {formatDate(exhibition.endDate)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-1 text-xs font-mono uppercase tracking-wider rounded-sm ${status.tone}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/exhibitions/${exhibition.slug}`}
                            className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-[var(--color-sienna)]"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
