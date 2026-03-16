"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
