'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { exhibitionService, Exhibition } from '@/features/exhibitions/services/exhibitionService';
import { DashboardTableSkeleton } from '@/components/ui/SkeletonPage';
import { StudioImagePlaceholder } from '@/components/ui/StudioImagePlaceholder';
import {
  WorkspaceCard,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspaceStatusPill,
} from '@/components/ui/WorkspacePrimitives';

type ExhibitionStatus = {
  label: string;
  tone: 'neutral' | 'accent' | 'success' | 'warning';
  order: number;
};

const primaryActionClass =
  'inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)]';
const secondaryActionClass =
  'inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]';

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

const formatDateRange = (startDate?: string, endDate?: string) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  if (start === 'TBA' && end === 'TBA') return 'Dates to be announced';
  if (start === end) return start;
  return `${start} - ${end}`;
};

const getStatus = (exhibition: Exhibition): ExhibitionStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseDate(exhibition.startDate);
  const end = parseDate(exhibition.endDate);

  if (start && start > today) {
    return { label: 'Upcoming', tone: 'accent', order: 1 };
  }
  if (end && end < today) {
    return { label: 'Archived', tone: 'neutral', order: 3 };
  }
  if (!start && !end) {
    return { label: 'Draft', tone: 'warning', order: 2 };
  }
  return { label: 'Active', tone: 'success', order: 0 };
};

const getSortValue = (exhibition: Exhibition) => {
  const start = parseDate(exhibition.startDate)?.getTime();
  const end = parseDate(exhibition.endDate)?.getTime();
  return start ?? end ?? 0;
};

export default function AdminExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExhibitions = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await exhibitionService.getAllExhibitions();
      setExhibitions(data);
    } catch (e) {
      console.error('Failed to load exhibitions', e);
      setError('Failed to load exhibitions.');
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadExhibitions();
  }, []);

  const sortedExhibitions = useMemo(
    () =>
      [...exhibitions].sort((left, right) => {
        const leftStatus = getStatus(left);
        const rightStatus = getStatus(right);

        if (leftStatus.order !== rightStatus.order) {
          return leftStatus.order - rightStatus.order;
        }

        const leftValue = getSortValue(left);
        const rightValue = getSortValue(right);

        if (leftStatus.label === 'Archived' && rightStatus.label === 'Archived') {
          return rightValue - leftValue;
        }

        return leftValue - rightValue;
      }),
    [exhibitions],
  );

  const activeCount = exhibitions.filter((exhibition) => getStatus(exhibition).label === 'Active').length;
  const upcomingCount = exhibitions.filter((exhibition) => getStatus(exhibition).label === 'Upcoming').length;
  const archivedCount = exhibitions.filter((exhibition) => getStatus(exhibition).label === 'Archived').length;
  const draftCount = exhibitions.filter((exhibition) => getStatus(exhibition).label === 'Draft').length;
  const featuredCount = exhibitions.filter((exhibition) => exhibition.isFeatured).length;

  if (loading) {
    return <DashboardTableSkeleton rows={6} columns={4} />;
  }

  return (
    <div className="content">
      <WorkspacePageHeader
        eyebrow="Exhibitions"
        title="Manage the public program with a clearer exhibition registry."
        description="Review exhibition records, update details, and open the public page."
        actions={
          <>
            <button
              type="button"
              onClick={() => void loadExhibitions({ silent: true })}
              className={secondaryActionClass}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/admin/exhibitions/new" className={primaryActionClass}>
              New Exhibition
            </Link>
          </>
        }
      />

      {error ? (
        <div className="mb-6 rounded-[20px] border border-[rgba(181,96,58,0.2)] bg-[rgba(181,96,58,0.08)] px-5 py-4 text-sm text-[#9f4c2d]">
          {error}
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <WorkspaceStatusPill tone="success">{activeCount} active</WorkspaceStatusPill>
        <WorkspaceStatusPill tone="accent">{upcomingCount} upcoming</WorkspaceStatusPill>
        <WorkspaceStatusPill tone={draftCount > 0 ? "warning" : "neutral"}>
          {draftCount} draft{draftCount === 1 ? "" : "s"}
        </WorkspaceStatusPill>
        <WorkspaceStatusPill tone="neutral">{archivedCount} archived</WorkspaceStatusPill>
        <WorkspaceStatusPill tone="accent">{featuredCount} featured</WorkspaceStatusPill>
      </div>

      {sortedExhibitions.length === 0 ? (
        <WorkspaceEmptyState
          title="No exhibitions yet"
          description="Create the first exhibition to start building the public program and artist submission flow."
          action={
            <Link href="/admin/exhibitions/new" className={primaryActionClass}>
              Create Exhibition
            </Link>
          }
        />
      ) : (
        <WorkspaceCard className="overflow-hidden">
          <div className="hidden border-b border-[var(--color-rule)] px-5 py-4 lg:grid lg:grid-cols-[minmax(0,1.45fr)_220px_180px_160px] lg:gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Exhibition</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Dates</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Status</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Actions</div>
          </div>

          <div>
            {sortedExhibitions.map((exhibition) => {
              const status = getStatus(exhibition);
              const description = exhibition.description?.trim()
                ? `${exhibition.description.slice(0, 130)}${exhibition.description.length > 130 ? '...' : ''}`
                : 'No exhibition note added yet.';

              return (
                <div
                  key={exhibition.id}
                  className="grid gap-4 border-t border-[var(--color-rule)] px-5 py-5 first:border-t-0 lg:grid-cols-[minmax(0,1.45fr)_220px_180px_160px] lg:items-center"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-[88px] w-[76px] shrink-0 overflow-hidden rounded-[18px] border border-[var(--color-rule)] bg-[var(--color-bone)]">
                      {exhibition.coverImageUrl ? (
                        <img src={exhibition.coverImageUrl} alt={exhibition.title} className="h-full w-full object-cover" />
                      ) : (
                        <StudioImagePlaceholder className="h-full w-full" markClassName="w-8" label="Cover" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-[30px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
                          {exhibition.title}
                        </h2>
                        {exhibition.isFeatured ? <WorkspaceStatusPill tone="accent">Featured</WorkspaceStatusPill> : null}
                      </div>
                      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                        {exhibition.slug}
                      </div>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-warm-slate)]">{description}</p>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)] lg:hidden">
                      Dates
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--color-near-black)] lg:mt-0">
                      {formatDateRange(exhibition.startDate, exhibition.endDate)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)] lg:hidden">
                      Status
                    </div>
                    <WorkspaceStatusPill tone={status.tone}>{status.label}</WorkspaceStatusPill>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/exhibitions/${exhibition.id}`}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-bone)] px-4 text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-white"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/exhibitions/${exhibition.slug}`}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-4 text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </WorkspaceCard>
      )}
    </div>
  );
}
