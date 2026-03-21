"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

interface PublicProfileOwnerActionsProps {
  artistId: string;
  artistSlug?: string | null;
  compact?: boolean;
  showEditProfile?: boolean;
  showManageArtworks?: boolean;
}

export function PublicProfileOwnerActions({
  artistId,
  artistSlug,
  compact = false,
  showEditProfile = true,
  showManageArtworks = true,
}: PublicProfileOwnerActionsProps) {
  const { session, profile, loading } = useAuth();

  if (loading || !session?.user || !profile) {
    return null;
  }

  const normalizedProfileSlug = (profile.slug || "").trim().toLowerCase();
  const normalizedArtistSlug = (artistSlug || "").trim().toLowerCase();
  const isOwner =
    profile.id === artistId ||
    (normalizedProfileSlug.length > 0 &&
      normalizedArtistSlug.length > 0 &&
      normalizedProfileSlug === normalizedArtistSlug);

  if (!isOwner) {
    return null;
  }

  const ownerCopy =
    showEditProfile && showManageArtworks
      ? "You are viewing the public version of your artist page. Update your profile details or manage the artworks shown here."
      : showEditProfile
        ? "You are viewing the public version of your artist page. Use this shortcut when you want to refine the way your profile reads to visitors."
        : "This is your public works page. Use it as the public-facing view of the artworks you are managing in the artist portal.";

  if (compact) {
    return (
      <div className="mt-6 flex flex-wrap gap-3">
        {showEditProfile ? (
          <Link
            href="/artist/profile"
            className="inline-flex items-center justify-center border border-[var(--color-near-black)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
          >
            Edit Profile
          </Link>
        ) : null}
        {showManageArtworks ? (
          <Link
            href="/artist/artworks/manage"
            className="inline-flex items-center justify-center border border-[var(--color-rule)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-warm-slate)] transition-colors duration-300 hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
          >
            Manage Artworks
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-[620px] rounded-[24px] border border-[var(--color-rule)] bg-[rgba(255,253,250,0.86)] p-5 md:p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-dust)]">
        Your public profile
      </div>
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="max-w-[420px] text-sm leading-[1.7] text-[var(--color-warm-slate)]">
          {ownerCopy}
        </p>
        <div className="flex flex-wrap gap-3">
          {showEditProfile ? (
            <Link
              href="/artist/profile"
              className="inline-flex items-center justify-center border border-[var(--color-near-black)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-near-black)] transition-colors duration-300 hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]"
            >
              Edit Profile
            </Link>
          ) : null}
          {showManageArtworks ? (
            <Link
              href="/artist/artworks/manage"
              className="inline-flex items-center justify-center border border-[var(--color-rule)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-warm-slate)] transition-colors duration-300 hover:border-[var(--color-near-black)] hover:text-[var(--color-near-black)]"
            >
              Manage Artworks
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
