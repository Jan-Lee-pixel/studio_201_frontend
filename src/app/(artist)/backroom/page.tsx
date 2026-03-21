"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { EditorialModal } from "@/components/ui/EditorialModal";
import { MerchItemForm } from "@/features/merch/components/MerchItemForm";
import { merchService, MerchItem } from "@/features/merch/services/merchService";
import { DashboardTableSkeleton } from "@/components/ui/SkeletonPage";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default function ArtistBackroomPage() {
  const { profile, session, loading } = useAuth();
  const [items, setItems] = useState<MerchItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = session?.access_token;
  const authUserId = session?.user?.id;

  const loadItems = async () => {
    if (!token) return;
    setLoadingItems(true);
    setError(null);
    try {
      const data = await merchService.getMyMerch(token);
      setItems(data);
    } catch (e) {
      console.error("Failed to load merch items", e);
      setError("Failed to load merch items.");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (token) {
      void loadItems();
    }
  }, [token]);

  const stats = useMemo(() => {
    return {
      draft: items.filter((item) => item.status === "draft").length,
      pending: items.filter((item) => item.status === "pending").length,
      published: items.filter((item) => item.status === "published").length,
    };
  }, [items]);

  if (loading || !token || !authUserId) {
    return <DashboardTableSkeleton rows={4} columns={4} />;
  }

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="page-title">Merch & Backroom</h1>
            <p className="page-subtitle text-gray-400">
              Add merch and backroom items, then request where they should live on the public merch page.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/merch" className="btn btn-secondary btn-sm">
              View Public Merch
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setEditingItem(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Add New Item
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="border border-[var(--color-rule)] bg-white p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Draft</div>
          <div className="mt-3 font-display text-4xl text-[var(--color-near-black)]">{stats.draft}</div>
          <div className="mt-2 text-sm text-[var(--color-warm-slate)]">Still private and editable.</div>
        </div>
        <div className="border border-[var(--color-rule)] bg-white p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Pending</div>
          <div className="mt-3 font-display text-4xl text-[var(--color-near-black)]">{stats.pending}</div>
          <div className="mt-2 text-sm text-[var(--color-warm-slate)]">Waiting for Studio 201 review.</div>
        </div>
        <div className="border border-[var(--color-rule)] bg-white p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Published</div>
          <div className="mt-3 font-display text-4xl text-[var(--color-near-black)]">{stats.published}</div>
          <div className="mt-2 text-sm text-[var(--color-warm-slate)]">Currently visible in the public merch channel.</div>
        </div>
      </section>

      <section className="mb-10">
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

      <section className="border border-[var(--color-rule)] bg-white p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[var(--color-near-black)]">Your items</h2>
            <p className="mt-2 text-sm text-[var(--color-warm-slate)]">
              Keep drafts here, request merch or backroom placement, and submit pieces for Studio 201 review.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => void loadItems()}>
            Refresh
          </button>
        </div>

        {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}

        {loadingItems ? (
          <DashboardTableSkeleton rows={4} columns={4} />
        ) : items.length === 0 ? (
          <div className="py-10 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
            No merch items yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const canEdit = !["published", "sold"].includes(item.status);
              const canSubmit = ["draft", "hidden", "approved"].includes(item.status);
              const publicHref = `/merch/${item.slug}`;

              return (
                <div key={item.id} className="flex flex-col gap-5 border border-[var(--color-rule)] bg-[var(--color-bone)] p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded border border-[var(--color-rule)] bg-white">
                      {item.primaryImageUrl ? (
                        <img src={item.primaryImageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <StudioImagePlaceholder className="h-full w-full" markClassName="w-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-[28px] leading-none text-[var(--color-near-black)]">{item.title}</div>
                      <div className="mt-2 text-sm text-[var(--color-warm-slate)]">
                        {[item.itemType, item.channel, item.priceLabel].filter(Boolean).join(" · ")}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-near-black)]">
                          {statusLabel(item.status)}
                        </span>
                        <span className="inline-flex rounded-full border border-[var(--color-rule)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)]">
                          {statusLabel(item.visibility)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    {canEdit ? (
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingItem(item)}>
                        Edit
                      </button>
                    ) : null}
                    {canSubmit ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={async () => {
                          try {
                            await merchService.submitMerchItem(item.id, token);
                            await loadItems();
                          } catch (e) {
                            console.error("Failed to submit merch item", e);
                            setError("Failed to submit item for review.");
                          }
                        }}
                      >
                        Submit for Review
                      </button>
                    ) : null}
                    {item.status === "published" ? (
                      <Link href={publicHref} className="btn btn-secondary btn-sm">
                        View Public
                      </Link>
                    ) : null}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        try {
                          await merchService.deleteMerchItem(item.id, token);
                          if (editingItem?.id === item.id) {
                            setEditingItem(null);
                          }
                          await loadItems();
                        } catch (e) {
                          console.error("Failed to delete merch item", e);
                          setError("Failed to delete item.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
              void loadItems();
            }}
          />
        ) : null}
      </EditorialModal>
    </div>
  );
}
