"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PublicSurface } from "@/components/ui/PublicPagePrimitives";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/features/auth/services/authService";

const AUTO_REFRESH_MS = 30000;

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
    [router, supabase],
  );

  const checkLatestStatus = useCallback(async () => {
    if (!session?.access_token) return;

    setRefreshing(true);
    setStatusMessage(null);

    try {
      const latestProfile = await authService.getProfile(session.access_token);
      const didRoute = await routeFromProfile(latestProfile.accountStatus, latestProfile.role);
      if (!didRoute && latestProfile.accountStatus?.toLowerCase() === "pending") {
        setStatusMessage("Still pending review. The page checks again automatically while this tab stays open.");
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
      if (document.visibilityState === "visible") {
        void checkLatestStatus();
      }
    }, AUTO_REFRESH_MS);

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        void checkLatestStatus();
      }
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_36%,var(--color-bone)_100%)] pt-28">
      <div className="mx-auto max-w-[860px] px-6 pb-20 md:px-12 md:pb-24">
        <PublicSurface className="overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="p-6 md:p-10">
              <SectionLabel>Application Status</SectionLabel>
              <h1 className="mt-5 max-w-[12ch] font-display text-[clamp(34px,9vw,72px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-near-black)] md:mt-6 md:max-w-[13ch] md:leading-[0.92]">
                Your artist application is pending review.
              </h1>
              <p className="mt-5 max-w-[46ch] text-[15px] leading-7 text-[var(--color-warm-slate)] md:mt-6 md:text-sm md:leading-8">
                Studio 201 reviews artist access before opening the portal. You can return here anytime to check the
                latest approval status.
              </p>

              {statusMessage ? (
                <div className="mt-6 rounded-[18px] border border-[var(--color-rule)] bg-[rgba(250,248,244,0.78)] px-4 py-3 text-[15px] text-[var(--color-warm-slate)] md:text-sm">
                  {statusMessage}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => void checkLatestStatus()} disabled={refreshing} className="w-full sm:w-auto">
                  {refreshing ? "Checking Status..." : "Check Approval Status"}
                </Button>
                <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto">
                  Sign Out
                </Button>
              </div>

              <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">
                Automatic refresh every 30 seconds while this tab is visible
              </div>
            </div>

            <div className="border-t border-[var(--color-rule)] bg-[var(--color-bone)] px-6 py-6 lg:border-l lg:border-t-0 lg:px-8 lg:py-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-dust)] md:text-[10px]">Next steps</div>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--color-warm-slate)] md:text-sm">
                <p>Approval routes you directly into the artist workspace.</p>
                <p>Rejected applications are signed out and returned to the public login page.</p>
                <p>
                  <Link href="/" className="text-[var(--color-sienna)] transition-colors duration-200 hover:text-[var(--color-near-black)]">
                    Return to the public site
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </PublicSurface>
      </div>
    </div>
  );
}
