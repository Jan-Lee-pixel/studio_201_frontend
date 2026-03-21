"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { DashboardTableSkeleton } from "@/components/ui/SkeletonPage";
import { EditorialModal } from "@/components/ui/EditorialModal";
import { MerchItemForm } from "@/features/merch/components/MerchItemForm";
import {
  merchService,
  MerchItem,
  MerchChannel,
  MerchStatus,
  MerchVisibility,
  MERCH_CHANNEL_OPTIONS,
  MERCH_STATUS_OPTIONS,
  MERCH_VISIBILITY_OPTIONS,
} from "@/features/merch/services/merchService";
import { userService } from "@/features/admin/services/userService";
import type { UserProfile } from "@/features/auth/services/authService";
import { StudioImagePlaceholder } from "@/components/ui/StudioImagePlaceholder";

type RowDraft = {
  channel: MerchChannel;
  status: MerchStatus;
  visibility: MerchVisibility;
  isFeatured: boolean;
  sortOrder: string;
  inquiryEmail: string;
};

function buildDrafts(items: MerchItem[]): Record<string, RowDraft> {
  return items.reduce<Record<string, RowDraft>>((acc, item) => {
    acc[item.id] = {
      channel: item.channel,
      status: item.status,
      visibility: item.visibility,
      isFeatured: item.isFeatured,
      sortOrder: item.sortOrder != null ? String(item.sortOrder) : "",
      inquiryEmail: item.inquiryEmail || "",
    };
    return acc;
  }, {});
}

export default function AdminMerchPage() {
  const { session, loading } = useAuth();
  const [items, setItems] = useState<MerchItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = session?.access_token;
  const authUserId = session?.user?.id;

  const loadData = async () => {
    if (!token) return;
    setLoadingData(true);
    setError(null);
    try {
      const [nextItems, nextUsers] = await Promise.all([
        merchService.getAdminMerch(token),
        userService.getAllUsers(),
      ]);
      setItems(nextItems);
      setUsers(nextUsers);
      setDrafts(buildDrafts(nextItems));
    } catch (e) {
      console.error("Failed to load merch admin data", e);
      setError("Failed to load merch data.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      void loadData();
    }
  }, [token]);

  const artistOptions = useMemo(
    () =>
      users
        .filter((user) => user.accountStatus === "approved" && user.role === "artist")
        .map((user) => ({ id: user.id, fullName: user.fullName })),
    [users],
  );

  const pendingItems = items.filter((item) => item.status === "pending");
  const approvedItems = items.filter((item) => item.status === "approved");
  const catalogItems = items.filter((item) => item.status !== "pending" && item.status !== "approved");

  if (loading || !token || !authUserId) {
    return <DashboardTableSkeleton rows={5} columns={4} />;
  }

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="page-title">Merch</h1>
            <p className="page-subtitle text-gray-400">
              Curate Studio 201 merch and approve artist-contributed backroom items.
            </p>
          </div>
          <Link href="/merch" className="btn btn-secondary btn-sm">
            View Public Merch
          </Link>
        </div>
      </div>

      <section className="mb-10">
        <MerchItemForm
          token={token}
          authUserId={authUserId}
          mode="admin"
          artistOptions={artistOptions}
          submitLabel="Create merch item"
          onSuccess={() => {
            void loadData();
          }}
        />
      </section>

      <section className="border border-[var(--color-rule)] bg-white p-6 mb-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[var(--color-near-black)]">Pending backroom review</h2>
            <p className="mt-2 text-sm text-[var(--color-warm-slate)]">
              Artist-submitted backroom items land here first. Approve them for the release queue, publish them directly, or hide them from the public catalog.
            </p>
          </div>
        </div>

        {pendingItems.length === 0 ? (
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
            No pending backroom items.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 border border-[var(--color-rule)] bg-[var(--color-bone)] p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded border border-[var(--color-rule)] bg-white">
                    {item.primaryImageUrl ? (
                      <img src={item.primaryImageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <StudioImagePlaceholder className="h-full w-full" markClassName="w-6" />
                    )}
                  </div>
                  <div>
                    <div className="font-display text-[28px] leading-none text-[var(--color-near-black)]">{item.title}</div>
                    <div className="mt-2 text-sm text-[var(--color-warm-slate)]">
                      {[item.artistName, item.itemType, item.priceLabel].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      try {
                        setSavingId(item.id);
                        await merchService.updateMerchItem(
                          item.id,
                          { status: "approved", visibility: "public", channel: "backroom" },
                          token,
                        );
                        await loadData();
                      } catch (e) {
                        console.error("Failed to approve merch item", e);
                        setError("Failed to approve pending item.");
                      } finally {
                        setSavingId(null);
                      }
                    }}
                    disabled={savingId === item.id}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-terracotta btn-sm"
                    onClick={async () => {
                      try {
                        setSavingId(item.id);
                        await merchService.updateMerchItem(
                          item.id,
                          { status: "published", visibility: "public", channel: "backroom" },
                          token,
                        );
                        await loadData();
                      } catch (e) {
                        console.error("Failed to publish merch item", e);
                        setError("Failed to publish pending item.");
                      } finally {
                        setSavingId(null);
                      }
                    }}
                    disabled={savingId === item.id}
                  >
                    Publish
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingItem(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      try {
                        setSavingId(item.id);
                        await merchService.updateMerchItem(
                          item.id,
                          { status: "hidden", visibility: "hidden" },
                          token,
                        );
                        await loadData();
                      } catch (e) {
                        console.error("Failed to hide merch item", e);
                        setError("Failed to hide pending item.");
                      } finally {
                        setSavingId(null);
                      }
                    }}
                    disabled={savingId === item.id}
                  >
                    Hide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-[var(--color-rule)] bg-white p-6 mb-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[var(--color-near-black)]">Approved and ready to publish</h2>
            <p className="mt-2 text-sm text-[var(--color-warm-slate)]">
              Approved items are not public yet. Publish them to the merch page or backroom when you are ready.
            </p>
          </div>
        </div>

        {approvedItems.length === 0 ? (
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
            No approved items waiting for release.
          </div>
        ) : (
          <div className="space-y-4">
            {approvedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 border border-[var(--color-rule)] bg-[var(--color-bone)] p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded border border-[var(--color-rule)] bg-white">
                    {item.primaryImageUrl ? (
                      <img src={item.primaryImageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <StudioImagePlaceholder className="h-full w-full" markClassName="w-6" />
                    )}
                  </div>
                  <div>
                    <div className="font-display text-[28px] leading-none text-[var(--color-near-black)]">{item.title}</div>
                    <div className="mt-2 text-sm text-[var(--color-warm-slate)]">
                      {[item.artistName, item.itemType, item.channel].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="btn btn-terracotta btn-sm"
                    onClick={async () => {
                      try {
                        setSavingId(item.id);
                        await merchService.updateMerchItem(
                          item.id,
                          { status: "published", visibility: "public" },
                          token,
                        );
                        await loadData();
                      } catch (e) {
                        console.error("Failed to publish approved merch item", e);
                        setError("Failed to publish approved item.");
                      } finally {
                        setSavingId(null);
                      }
                    }}
                    disabled={savingId === item.id}
                  >
                    Publish
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingItem(item)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={async () => {
                      try {
                        setSavingId(item.id);
                        await merchService.updateMerchItem(
                          item.id,
                          { status: "hidden", visibility: "hidden" },
                          token,
                        );
                        await loadData();
                      } catch (e) {
                        console.error("Failed to hide approved merch item", e);
                        setError("Failed to hide approved item.");
                      } finally {
                        setSavingId(null);
                      }
                    }}
                    disabled={savingId === item.id}
                  >
                    Hide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-[var(--color-rule)] bg-white p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-[var(--color-near-black)]">Merch catalog</h2>
            <p className="mt-2 text-sm text-[var(--color-warm-slate)]">
              Update public status, feature placement, and ordering for live merch and staged catalog items.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => void loadData()}>
            Refresh
          </button>
        </div>

        {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}

        {loadingData ? (
          <DashboardTableSkeleton rows={6} columns={5} />
        ) : catalogItems.length === 0 ? (
          <div className="py-10 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-dust)]">
            No live or staged merch items yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                  <th className="pb-3 pr-4 font-normal">Item</th>
                  <th className="pb-3 px-4 font-normal">Artist</th>
                  <th className="pb-3 px-4 font-normal">Channel</th>
                  <th className="pb-3 px-4 font-normal">Status</th>
                  <th className="pb-3 px-4 font-normal">Visibility</th>
                  <th className="pb-3 px-4 font-normal">Feature</th>
                  <th className="pb-3 px-4 font-normal">Order</th>
                  <th className="pb-3 px-4 font-normal">Inquiry</th>
                  <th className="pb-3 px-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {catalogItems.map((item) => {
                  const draft = drafts[item.id];
                  if (!draft) return null;

                  return (
                    <tr key={item.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded border border-[var(--color-rule)] bg-white">
                            {item.primaryImageUrl ? (
                              <img src={item.primaryImageUrl} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <StudioImagePlaceholder className="h-full w-full" markClassName="w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--color-near-black)]">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.itemType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{item.artistName || "Studio 201"}</td>
                      <td className="py-4 px-4">
                        <select
                          value={draft.channel}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], channel: event.target.value as MerchChannel },
                            }))
                          }
                          className="rounded border border-[var(--color-rule)] bg-white px-2 py-2 text-sm"
                        >
                          {MERCH_CHANNEL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={draft.status}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], status: event.target.value as MerchStatus },
                            }))
                          }
                          className="rounded border border-[var(--color-rule)] bg-white px-2 py-2 text-sm"
                        >
                          {MERCH_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={draft.visibility}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], visibility: event.target.value as MerchVisibility },
                            }))
                          }
                          className="rounded border border-[var(--color-rule)] bg-white px-2 py-2 text-sm"
                        >
                          {MERCH_VISIBILITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <label className="inline-flex items-center gap-2 text-sm text-gray-500">
                          <input
                            type="checkbox"
                            checked={draft.isFeatured}
                            onChange={(event) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], isFeatured: event.target.checked },
                              }))
                            }
                          />
                          Featured
                        </label>
                      </td>
                      <td className="py-4 px-4">
                        <input
                          value={draft.sortOrder}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], sortOrder: event.target.value },
                            }))
                          }
                          inputMode="numeric"
                          placeholder="Auto"
                          className="w-20 rounded border border-[var(--color-rule)] bg-white px-2 py-2 text-sm"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input
                          value={draft.inquiryEmail}
                          onChange={(event) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], inquiryEmail: event.target.value },
                            }))
                          }
                          className="w-48 rounded border border-[var(--color-rule)] bg-white px-2 py-2 text-sm"
                          placeholder="studio@example.com"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={async () => {
                              const hasSortOrder = Boolean(draft.sortOrder.trim());
                              const parsedSortOrder = hasSortOrder
                                ? Number.parseInt(draft.sortOrder.trim(), 10)
                                : null;
                              if (
                                hasSortOrder &&
                                (!Number.isFinite(parsedSortOrder as number) || (parsedSortOrder as number) < 0)
                              ) {
                                setError("Sort order must be a whole number starting from 0.");
                                return;
                              }

                              try {
                                setSavingId(item.id);
                                await merchService.updateMerchItem(
                                  item.id,
                                  {
                                    channel: draft.channel,
                                    status: draft.status,
                                    visibility: draft.visibility,
                                    isFeatured: draft.isFeatured,
                                    sortOrder: parsedSortOrder,
                                    inquiryEmail: draft.inquiryEmail || null,
                                  },
                                  token,
                                );
                                await loadData();
                              } catch (e) {
                                console.error("Failed to update merch item", e);
                                setError("Failed to update merch item.");
                              } finally {
                                setSavingId(null);
                              }
                            }}
                            disabled={savingId === item.id}
                          >
                            Save
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingItem(item)}>
                            Edit
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={async () => {
                              try {
                                setSavingId(item.id);
                                await merchService.deleteMerchItem(item.id, token);
                                if (editingItem?.id === item.id) setEditingItem(null);
                                await loadData();
                              } catch (e) {
                                console.error("Failed to delete merch item", e);
                                setError("Failed to delete merch item.");
                              } finally {
                                setSavingId(null);
                              }
                            }}
                            disabled={savingId === item.id}
                          >
                            Delete
                          </button>
                          {item.status === "published" ? (
                            <Link href={`/merch/${item.slug}`} className="btn btn-secondary btn-sm">
                              View
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <EditorialModal
        open={Boolean(editingItem)}
        title={editingItem ? `Edit ${editingItem.title}` : "Edit merch item"}
        description="Update the merch record, image, release settings, and inquiry details without leaving the page."
        onClose={() => setEditingItem(null)}
      >
        {editingItem ? (
          <MerchItemForm
            token={token}
            authUserId={authUserId}
            mode="admin"
            item={editingItem}
            artistOptions={artistOptions}
            submitLabel="Save merch item"
            onCancel={() => setEditingItem(null)}
            onSuccess={() => {
              setEditingItem(null);
              void loadData();
            }}
          />
        ) : null}
      </EditorialModal>
    </div>
  );
}
