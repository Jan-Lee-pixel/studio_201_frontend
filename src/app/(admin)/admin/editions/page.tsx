"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { DashboardTableSkeleton } from "@/components/ui/SkeletonPage";
import { merchService, type MerchItem } from "@/features/merch/services/merchService";
import {
  WorkspaceCard,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspaceStatusPill,
} from "@/components/ui/WorkspacePrimitives";
import { formatCatalogItemType, getCatalogItemHref } from "@/features/merch/utils/publicCatalog";

export default function AdminEditionsPage() {
  const { session, loading } = useAuth();
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;

    const loadItems = async () => {
      try {
        const data = await merchService.getAdminMerch(session.access_token);
        setItems(data.filter((item) => item.itemType === "edition"));
      } catch (error) {
        console.error("Failed to load admin editions", error);
      } finally {
        setLoadingItems(false);
      }
    };

    void loadItems();
  }, [session?.access_token]);

  const featuredCount = useMemo(() => items.filter((item) => item.isFeatured).length, [items]);

  if (loading || loadingItems || !session?.access_token) {
    return <DashboardTableSkeleton rows={4} columns={4} />;
  }

  return (
    <div className="content">
      <WorkspacePageHeader
        eyebrow="Editions"
        title="Track published edition items."
        description="Editions now follow the real merch catalog instead of a mock-only public collection."
        actions={
          <Link href="/editions" className="btn btn-secondary btn-sm">
            View Public Editions
          </Link>
        }
      />

      <WorkspaceCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
            {items.length} edition item{items.length === 1 ? "" : "s"}
          </div>
          <WorkspaceStatusPill tone={featuredCount > 0 ? "accent" : "neutral"}>
            {featuredCount} featured
          </WorkspaceStatusPill>
        </div>

        {items.length === 0 ? (
          <div className="p-8">
            <WorkspaceEmptyState
              title="No edition items yet"
              description="Create or publish merch items with the edition type and they will appear here automatically."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-rule)] bg-white text-left">
                  <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Title</th>
                  <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Artist</th>
                  <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Channel</th>
                  <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Status</th>
                  <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--color-rule)] last:border-b-0">
                    <td className="px-6 py-5">
                      <div className="font-display text-[26px] leading-none tracking-[-0.04em] text-[var(--color-near-black)]">
                        {item.title}
                      </div>
                      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
                        {formatCatalogItemType(item.itemType)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[var(--color-warm-slate)]">
                      {item.artistName || "Studio 201"}
                    </td>
                    <td className="px-6 py-5">
                      <WorkspaceStatusPill tone="accent">
                        {item.channel === "backroom" ? "Backroom" : "Merch"}
                      </WorkspaceStatusPill>
                    </td>
                    <td className="px-6 py-5">
                      <WorkspaceStatusPill tone={item.status === "published" ? "success" : item.status === "pending" ? "warning" : "neutral"}>
                        {item.status}
                      </WorkspaceStatusPill>
                    </td>
                    <td className="px-6 py-5">
                      <Link href={getCatalogItemHref(item.slug, item.channel)} className="btn btn-secondary btn-sm">
                        View Live
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspaceCard>
    </div>
  );
}
