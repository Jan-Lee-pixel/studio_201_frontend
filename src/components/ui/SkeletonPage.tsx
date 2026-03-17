import clsx from "clsx";
import { Skeleton } from "@/components/ui/Skeleton";

type PublicSkeletonProps = {
  tone?: "light" | "dark";
};

export function PublicPageSkeleton({ tone = "light" }: PublicSkeletonProps) {
  const isDark = tone === "dark";
  const wrapperClass = clsx(
    "min-h-screen pt-28 pb-20 px-6 md:px-12",
    isDark ? "bg-[var(--color-charcoal)]" : "bg-[var(--color-parchment)]",
  );

  return (
    <div className={wrapperClass}>
      <div className="max-w-5xl">
        <Skeleton className="skeleton-line w-32" dark={isDark} />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-10 w-[70%]" dark={isDark} />
          <Skeleton className="h-6 w-[52%]" dark={isDark} />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3]" dark={isDark} />
            <Skeleton className="skeleton-line w-[70%]" dark={isDark} />
            <Skeleton className="skeleton-line w-[45%]" dark={isDark} />
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4]" dark={isDark} />
            <Skeleton className="skeleton-line w-[75%]" dark={isDark} />
            <Skeleton className="skeleton-line w-[55%]" dark={isDark} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardShellSkeleton() {
  return (
    <div className="page-view active dashboard-root">
      <div className="dashboard w-full">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Skeleton className="skeleton-line w-24 mb-2" dark />
            <Skeleton className="skeleton-line w-16" dark />
          </div>

          <div className="sidebar-section-label">
            <Skeleton className="skeleton-line w-20" dark />
          </div>
          <ul className="sidebar-nav">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="px-3 py-2">
                <Skeleton className="skeleton-line w-28" dark />
              </li>
            ))}
          </ul>

          <div className="sidebar-section-label">
            <Skeleton className="skeleton-line w-20" dark />
          </div>
          <ul className="sidebar-nav">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="px-3 py-2">
                <Skeleton className="skeleton-line w-32" dark />
              </li>
            ))}
          </ul>

          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <Skeleton className="skeleton-circle w-8 h-8" dark />
              <div className="sidebar-user-info space-y-2">
                <Skeleton className="skeleton-line w-20" dark />
                <Skeleton className="skeleton-line w-14" dark />
              </div>
            </div>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <div className="topbar-left">
              <Skeleton className="skeleton-line w-40" />
            </div>
            <div className="topbar-right">
              <Skeleton className="skeleton-line w-24" />
              <Skeleton className="skeleton-circle w-8 h-8" />
              <Skeleton className="skeleton-line w-28" />
            </div>
          </div>

          <DashboardContentSkeleton />
        </div>
      </div>
    </div>
  );
}

export function DashboardContentSkeleton({
  withWrapper = true,
  showHeader = true,
}: {
  withWrapper?: boolean;
  showHeader?: boolean;
}) {
  const content = (
    <>
      {showHeader ? (
        <div className="page-header">
          <Skeleton className="skeleton-line w-24 mb-3" />
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="skeleton-line w-72" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-[var(--color-rule)] bg-white p-6 space-y-3">
            <Skeleton className="skeleton-line w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="skeleton-line w-32" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </>
  );

  if (!withWrapper) {
    return content;
  }

  return <div className="content">{content}</div>;
}

export function DashboardTableSkeleton({
  rows = 6,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  const gridCols =
    columns === 5
      ? "grid-cols-5"
      : columns === 3
        ? "grid-cols-3"
        : "grid-cols-4";

  return (
    <div className="border border-[var(--color-rule)] bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)]">
        <Skeleton className="skeleton-line w-24" />
        <Skeleton className="skeleton-line w-20" />
      </div>
      <div className="px-6 py-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={`grid ${gridCols} gap-4 items-center`}>
            {Array.from({ length: columns }).map((__, j) => (
              <Skeleton key={j} className="skeleton-line w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
