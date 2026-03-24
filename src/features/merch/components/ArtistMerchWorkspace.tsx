"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { EditorialModal } from "@/components/ui/EditorialModal";
import { merchService, MerchItem } from "@/features/merch/services/merchService";
import { MerchItemForm } from "@/features/merch/components/MerchItemForm";
import { DashboardTableSkeleton } from "@/components/ui/SkeletonPage";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";
import {
  WorkspaceCard,
  WorkspaceEmptyState,
  WorkspacePageHeader,
  WorkspaceStatusPill,
} from "@/components/ui/WorkspacePrimitives";
import { getCatalogItemHref } from "@/features/merch/utils/publicCatalog";

type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger";

const primaryActionClass =
  "inline-flex min-h-[46px] items-center justify-center rounded-full bg-[var(--color-near-black)] px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors duration-200 hover:bg-[var(--color-charcoal)]";
const secondaryActionClass =
  "inline-flex min-h-[46px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-white px-5 text-xs uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-[var(--color-bone)]";
const subtleActionClass =
  "inline-flex min-h-[40px] items-center justify-center rounded-full border border-[var(--color-rule)] bg-[var(--color-bone)] px-4 text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-200 hover:bg-white";

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function titleCase(value: string) {
  return statusLabel(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusTone(status: string): StatusTone {
  switch (status) {
    case "published":
      return "success";
    case "approved":
      return "accent";
    case "pending":
      return "warning";
    case "sold":
      return "danger";
    default:
      return "neutral";
  }
}

export function ArtistMerchWorkspace() {
  const { session, loading } = useAuth();
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actioningItemId, setActioningItemId] = useState<string | null>(null);
  const token = session?.access_token;
  const authUserId = session?.user?.id;

  const loadItems = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!token) return;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoadingItems(true);
    }
    setError(null);
    try {
      const data = await merchService.getMyMerch(token);
      setItems(data);
    } catch (e) {
      console.error("Failed to load merch items", e);
      setError("Failed to load merch items.");
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoadingItems(false);
      }
    }
  };

  useEffect(() => {
    if (token) {
      void loadItems();
    }
  }, [token]);

  const orderedItems = useMemo(
    () =>
      [...items].sort((left, right) => {
        const leftValue = new Date(left.updatedAt || left.createdAt).getTime();
        const rightValue = new Date(right.updatedAt || right.createdAt).getTime();
        return rightValue - leftValue;
      }),
    [items],
  );

  const stats = useMemo(
    () => ({
      draft: items.filter((item) => item.status === "draft").length,
      pending: items.filter((item) => item.status === "pending").length,
      published: items.filter((item) => item.status === "published").length,
      merch: items.filter((item) => item.channel === "merch").length,
      backroom: items.filter((item) => item.channel === "backroom").length,
    }),
    [items],
  );

  const scrollToCreate = () => {
    setEditingItem(null);
    window.setTimeout(() => {
      document.getElementById("artist-merch-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  if (loading || !token || !authUserId) {
    return <DashboardTableSkeleton rows={4} columns={4} />;
  }

  return (
    <div className="content">
      <WorkspacePageHeader
        eyebrow="Merch & Backroom"
        title="Manage both release channels from one artist workspace."
        description="Create items, choose a release channel, and send them for review."
        actions={
          <>
            <Link href="/merch" className={secondaryActionClass}>
              View Merch
            </Link>
            <Link href="/backroom" className={secondaryActionClass}>
              View Backroom
            </Link>
            <button type="button" className={primaryActionClass} onClick={scrollToCreate}>
              Add New Item
            </button>
          </>
        }
      />

      {error ? (
        <div className="mb-6 rounded-[20px] border border-[rgba(181,96,58,0.2)] bg-[rgba(181,96,58,0.08)] px-5 py-4 text-sm text-[#9f4c2d]">
          {error}
        </div>
      ) : null}

      <div className="mb-8">
        <WorkspaceCard tone="charcoal">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <WorkspaceStatusPill tone="accent">Two public destinations</WorkspaceStatusPill>
              <WorkspaceStatusPill tone="warning">
                {stats.pending} pending review{stats.pending === 1 ? "" : "s"}
              </WorkspaceStatusPill>
            </div>

            <h2 className="mt-6 font-display text-[clamp(38px,5vw,64px)] leading-[0.9] tracking-[-0.06em] text-[var(--color-cream)]">
              Merch and backroom now publish separately.
            </h2>

            <p className="mt-6 max-w-[58ch] text-[15px] leading-8 text-[rgba(240,237,229,0.74)]">
              Use merch for more public-facing releases and backroom for quieter or rarer ones. The workflow stays in one place here.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.5)]">
                  Merch
                </div>
                <p className="mt-3 text-sm leading-7 text-[rgba(240,237,229,0.76)]">
                  Use this channel for more public-facing releases and standard catalog pieces.
                </p>
              </div>
              <div className="rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(240,237,229,0.5)]">
                  Backroom
                </div>
                <p className="mt-3 text-sm leading-7 text-[rgba(240,237,229,0.76)]">
                  Reserved for rarer or quieter releases that belong in a separate public space once approved.
                </p>
              </div>
            </div>
          </div>
        </WorkspaceCard>
      </div>

      <div className="space-y-8">
        <section id="artist-merch-form">
          <div className="mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
              Create Item
            </div>
            <h2 className="mt-3 font-display text-[34px] leading-[0.95] tracking-[-0.04em] text-[var(--color-near-black)]">
              Add merch or backroom work.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-warm-slate)]">
              Use the same form for both release channels.
            </p>
          </div>

          <MerchItemForm
            token={token}
            authUserId={authUserId}
            mode="artist"
            submitLabel="Create item"
            onSuccess={() => {
              void loadItems();
            }}
          />
        </section>

        <section>
          <WorkspaceCard>
            <div className="p-6">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
                    Inventory
                  </div>
                  <h2 className="mt-3 font-display text-[34px] leading-[0.95] tracking-[-0.04em] text-[var(--color-near-black)]">
                    Your items
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-warm-slate)]">
                    Keep drafts here, request merch or backroom placement, and submit pieces for review when the item is ready for public release.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadItems({ silent: true })}
                  className={subtleActionClass}
                >
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {loadingItems ? (
                <DashboardTableSkeleton rows={4} columns={4} />
              ) : orderedItems.length === 0 ? (
                <WorkspaceEmptyState
                  title="No merch items yet"
                  description="Create your first merch or backroom item above. Each one can now publish to its own public destination once released."
                />
              ) : (
                <div className="space-y-4">
                  {orderedItems.map((item) => {
                    const canEdit = !["published", "sold"].includes(item.status);
                    const canSubmit = ["draft", "hidden", "approved"].includes(item.status);
                    const publicHref = getCatalogItemHref(item.slug, item.channel);

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-5 border-t border-[var(--color-rule)] py-5 first:border-t-0 first:pt-0 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[18px] border border-[var(--color-rule)] bg-[var(--color-bone)]">
                            {item.primaryImageUrl ? (
                              <img src={item.primaryImageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <StudioImagePlaceholder className="h-full w-full" markClassName="w-6" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-display text-[30px] leading-[0.94] tracking-[-0.04em] text-[var(--color-near-black)]">
                              {item.title}
                            </div>
                            <p className="mt-3 text-sm leading-7 text-[var(--color-warm-slate)]">
                              {[titleCase(item.itemType), item.artistName, item.priceLabel].filter(Boolean).join(" · ")}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <WorkspaceStatusPill tone={getStatusTone(item.status)}>
                                {titleCase(item.status)}
                              </WorkspaceStatusPill>
                              <WorkspaceStatusPill tone="accent">{titleCase(item.channel)}</WorkspaceStatusPill>
                              <WorkspaceStatusPill tone="neutral">{titleCase(item.visibility)}</WorkspaceStatusPill>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                          {canEdit ? (
                            <button
                              type="button"
                              className={subtleActionClass}
                              onClick={() => setEditingItem(item)}
                            >
                              Edit
                            </button>
                          ) : null}
                          {canSubmit ? (
                            <button
                              type="button"
                              className={secondaryActionClass}
                              onClick={async () => {
                                try {
                                  setActioningItemId(item.id);
                                  await merchService.submitMerchItem(item.id, token);
                                  await loadItems({ silent: true });
                                } catch (e) {
                                  console.error("Failed to submit merch item", e);
                                  setError("Failed to submit item for review.");
                                } finally {
                                  setActioningItemId(null);
                                }
                              }}
                              disabled={actioningItemId === item.id}
                            >
                              {actioningItemId === item.id ? "Submitting..." : "Submit for Review"}
                            </button>
                          ) : null}
                          {item.status === "published" ? (
                            <Link href={publicHref} className={subtleActionClass}>
                              View Live Page
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className={subtleActionClass}
                            onClick={async () => {
                              try {
                                setActioningItemId(item.id);
                                await merchService.deleteMerchItem(item.id, token);
                                if (editingItem?.id === item.id) {
                                  setEditingItem(null);
                                }
                                await loadItems({ silent: true });
                              } catch (e) {
                                console.error("Failed to delete merch item", e);
                                setError("Failed to delete item.");
                              } finally {
                                setActioningItemId(null);
                              }
                            }}
                            disabled={actioningItemId === item.id}
                          >
                            {actioningItemId === item.id ? "Working..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </WorkspaceCard>
        </section>
      </div>

      <EditorialModal
        open={Boolean(editingItem)}
        title={editingItem ? `Edit ${editingItem.title}` : "Edit merch item"}
        description="Refine the item details, replace the image, or adjust where this piece should be considered for release."
        onClose={() => setEditingItem(null)}
      >
        {editingItem ? (
          <MerchItemForm
            token={token}
            authUserId={authUserId}
            mode="artist"
            item={editingItem}
            submitLabel="Save item"
            onCancel={() => setEditingItem(null)}
            onSuccess={() => {
              setEditingItem(null);
              void loadItems({ silent: true });
            }}
          />
        ) : null}
      </EditorialModal>
    </div>
  );
}
