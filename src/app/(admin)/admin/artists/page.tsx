"use client";

import { useEffect, useState } from "react";
import { userService, UserAccessUpdate } from "@/features/admin/services/userService";
import type { UserProfile } from "@/features/auth/services/authService";
import { DashboardTableSkeleton } from "@/components/ui/SkeletonPage";

export default function AdminArtistsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rankDrafts, setRankDrafts] = useState<Record<string, string>>({});

  const syncRankDrafts = (nextUsers: UserProfile[]) => {
    setRankDrafts(
      nextUsers.reduce<Record<string, string>>((acc, user) => {
        acc[user.id] = user.artistRank != null ? String(user.artistRank) : "";
        return acc;
      }, {})
    );
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      syncRankDrafts(data);
    } catch (e) {
      console.error("Failed to load users", e);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateAccess = async (userId: string, update: UserAccessUpdate) => {
    setUpdatingId(userId);
    setError(null);
    try {
      const updated = await userService.updateUserAccess(userId, update);
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
      setRankDrafts((prev) => ({
        ...prev,
        [userId]: updated.artistRank != null ? String(updated.artistRank) : "",
      }));
    } catch (e) {
      console.error("Failed to update user access", e);
      setError("Failed to update user access.");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateArtistRank = async (userId: string, artistRank: number | null) => {
    setUpdatingId(userId);
    setError(null);
    try {
      await userService.updateArtistRank(userId, { artistRank });
      await loadUsers();
    } catch (e) {
      console.error("Failed to update artist rank", e);
      setError("Failed to update artist ranking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingUsers = users.filter((user) => user.accountStatus?.toLowerCase() === "pending");
  const publicArtists = users
    .filter((user) => {
      const normalizedRole = user.role?.toLowerCase();
      const normalizedStatus = user.accountStatus?.toLowerCase();
      return normalizedStatus === "approved" && (normalizedRole === "artist" || !normalizedRole);
    })
    .sort((a, b) => {
      const aRank = a.artistRank ?? Number.MAX_SAFE_INTEGER;
      const bRank = b.artistRank ?? Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Artist Applications</h1>
        <p className="page-subtitle text-gray-400">Review and approve artist access to Studio 201.</p>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 rounded font-dm-mono">
          {error}
        </div>
      )}

      {loading ? (
        <DashboardTableSkeleton rows={5} columns={4} />
      ) : (
        <>
          <section className="border border-[var(--color-rule)] bg-[var(--color-bone)] p-6 mb-10">
            <h2 className="font-display text-xl mb-4">Pending Applications</h2>
            {pendingUsers.length === 0 ? (
              <div className="text-gray-500 font-dm-mono text-sm uppercase tracking-widest">
                No pending applications.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                      <th className="pb-3 pr-4 font-normal">Artist</th>
                      <th className="pb-3 px-4 font-normal">Email</th>
                      <th className="pb-3 px-4 font-normal">Applied</th>
                      <th className="pb-3 px-4 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-[var(--color-near-black)]">{user.fullName}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-500">{user.email}</td>
                        <td className="py-4 px-4 text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-terracotta btn-sm"
                              disabled={updatingId === user.id}
                              onClick={() => updateAccess(user.id, { role: "artist" })}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={updatingId === user.id}
                              onClick={() => updateAccess(user.id, { accountStatus: "rejected" })}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="border border-[var(--color-rule)] bg-white p-6 mb-10">
            <div className="flex flex-col gap-2 mb-4">
              <h2 className="font-display text-xl">Public Artist Ranking</h2>
              <p className="text-sm text-gray-500 max-w-2xl">
                Lower numbers appear first on the homepage and the public artists page. Leave a rank blank to keep an artist after all ranked artists.
              </p>
            </div>

            {publicArtists.length === 0 ? (
              <div className="text-gray-500 font-dm-mono text-sm uppercase tracking-widest">
                No public artists available for ranking yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                      <th className="pb-3 pr-4 font-normal">Artist</th>
                      <th className="pb-3 px-4 font-normal">Email</th>
                      <th className="pb-3 px-4 font-normal">Rank</th>
                      <th className="pb-3 px-4 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicArtists.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-4 pr-4">
                          <div className="font-medium text-[var(--color-near-black)]">{user.fullName}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-500">{user.email}</td>
                        <td className="py-4 px-4">
                          <input
                            type="number"
                            min={1}
                            inputMode="numeric"
                            className="w-24 rounded border border-[var(--color-rule)] px-3 py-2 bg-white text-sm"
                            value={rankDrafts[user.id] ?? ""}
                            onChange={(event) =>
                              setRankDrafts((prev) => ({
                                ...prev,
                                [user.id]: event.target.value,
                              }))
                            }
                            placeholder="Auto"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={updatingId === user.id}
                              onClick={() => {
                                const nextValue = (rankDrafts[user.id] ?? "").trim();
                                if (!nextValue) {
                                  void updateArtistRank(user.id, null);
                                  return;
                                }

                                const parsed = Number.parseInt(nextValue, 10);
                                if (!Number.isFinite(parsed) || parsed < 1) {
                                  setError("Artist rank must be a number starting from 1.");
                                  return;
                                }

                                void updateArtistRank(user.id, parsed);
                              }}
                            >
                              Save rank
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              disabled={updatingId === user.id}
                              onClick={() => {
                                setRankDrafts((prev) => ({ ...prev, [user.id]: "" }));
                                void updateArtistRank(user.id, null);
                              }}
                            >
                              Clear
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="border border-[var(--color-rule)] bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">All Users</h2>
              <button className="btn btn-secondary btn-sm" onClick={loadUsers}>
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                    <th className="pb-3 pr-4 font-normal">Name</th>
                    <th className="pb-3 px-4 font-normal">Email</th>
                    <th className="pb-3 px-4 font-normal">Access</th>
                    <th className="pb-3 px-4 font-normal">Artist Rank</th>
                    <th className="pb-3 px-4 font-normal">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-[var(--color-near-black)]">{user.fullName}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{user.email}</td>
                      <td className="py-4 px-4 text-gray-500" style={{ textTransform: "capitalize" }}>
                        {user.role ?? user.accountStatus}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {user.artistRank != null ? user.artistRank : "—"}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
