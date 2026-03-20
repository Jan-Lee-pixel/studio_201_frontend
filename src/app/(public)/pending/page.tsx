"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/features/auth/services/authService";

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const { profile, session, loading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const routeFromProfile = useCallback(
    async (accountStatus?: string | null, role?: string | null) => {
      const normalizedStatus = accountStatus?.toLowerCase();
      const normalizedRole = role?.toLowerCase();

      if (normalizedStatus === "approved" && normalizedRole === "artist") {
        router.replace("/artist/dashboard");
        return true;
      }

      if (normalizedStatus === "approved" && normalizedRole === "admin") {
        router.replace("/admin");
        return true;
      }

      if (normalizedStatus === "rejected") {
        await supabase.auth.signOut();
        router.replace("/login?error=Your application was not approved. Please contact Studio 201.");
        return true;
      }

      return false;
    },
    [router, supabase]
  );

  const checkLatestStatus = useCallback(async () => {
    if (!session?.access_token) return;

    setRefreshing(true);
    setStatusMessage(null);

    try {
      const latestProfile = await authService.getProfile(session.access_token);
      const didRoute = await routeFromProfile(latestProfile.accountStatus, latestProfile.role);
      if (!didRoute && latestProfile.accountStatus?.toLowerCase() === "pending") {
        setStatusMessage("Still pending review. This page will update automatically once approval is complete.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not refresh approval status.";
      setStatusMessage(message);
    } finally {
      setRefreshing(false);
    }
  }, [routeFromProfile, session?.access_token]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    void routeFromProfile(profile?.accountStatus, profile?.role);
  }, [loading, profile?.accountStatus, profile?.role, routeFromProfile, router, session]);

  useEffect(() => {
    if (!session?.access_token) return;

    const intervalId = window.setInterval(() => {
      void checkLatestStatus();
    }, 10000);

    const handleFocus = () => {
      void checkLatestStatus();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [checkLatestStatus, session?.access_token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-parchment)] px-6">
      <div className="max-w-lg w-full bg-white border border-[var(--color-rule)] p-10 text-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-sienna)] mb-4">
          Application Received
        </div>
        <h1 className="font-display text-3xl mb-4 text-[var(--color-near-black)]">
          Your artist application is pending approval
        </h1>
        <p className="font-body text-sm text-[var(--color-warm-slate)] leading-[1.75] mb-8">
          Studio 201 reviews artist applications before granting access to the artist portal.
          You will receive an update once the curatorial team completes the review.
        </p>
        <div className="mb-8 space-y-3">
          <Button onClick={() => void checkLatestStatus()} disabled={refreshing}>
            {refreshing ? "Checking Status..." : "Check Approval Status"}
          </Button>
          <p className="font-body text-xs text-[var(--color-dust)] leading-[1.7]">
            This page checks again automatically while you wait.
          </p>
          {statusMessage ? (
            <p className="font-body text-xs text-[var(--color-warm-slate)] leading-[1.7]">
              {statusMessage}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-block font-body text-xs tracking-[0.08em] uppercase px-7 py-3 border border-[var(--color-near-black)] text-[var(--color-near-black)] hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)] transition-colors duration-300 ease-[cubic-bezier(0.25,0,0,1)]"
          >
            Return Home
          </Link>
          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
