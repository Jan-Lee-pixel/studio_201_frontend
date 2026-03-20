"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  AUTH_MESSAGES,
  isSafeRelativePath,
  resolveAuthorizedDestination,
} from "@/lib/auth/destinations";
import { createClient } from "@/lib/supabase/client";

export default function AuthCompletePage() {
  const router = useRouter();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace(`/login?error=${encodeURIComponent(AUTH_MESSAGES.incompleteSignIn)}`);
      return;
    }

    if (!profile) return;

    const normalizedStatus = profile.accountStatus?.toLowerCase();
    if (normalizedStatus === "rejected") {
      const supabase = createClient();
      void supabase.auth.signOut().finally(() => {
        router.replace(`/login?error=${encodeURIComponent(AUTH_MESSAGES.rejected)}`);
      });
      return;
    }

    const nextParam =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
    const destination: string = isSafeRelativePath(nextParam)
      ? nextParam
      : resolveAuthorizedDestination(profile.role, profile.accountStatus) ||
        `/login?error=${encodeURIComponent(AUTH_MESSAGES.awaitingApproval)}`;
    router.replace(destination);
  }, [loading, profile, router, session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-parchment)] px-6">
      <div className="max-w-md w-full bg-white border border-[var(--color-rule)] p-10 text-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-sienna)] mb-4">
          Signing In
        </div>
        <h1 className="font-display text-3xl mb-4 text-[var(--color-near-black)]">
          Finishing your sign-in
        </h1>
        <p className="font-body text-sm text-[var(--color-warm-slate)] leading-[1.75]">
          Please wait while Studio 201 prepares your account.
        </p>
      </div>
    </div>
  );
}
