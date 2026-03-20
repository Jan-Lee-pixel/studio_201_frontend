'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { resolveAuthorizedDestination } from '@/lib/auth/destinations';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { session, profile, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const searchError = searchParams.get('error');
  const visibleError = error || searchError;
  const helperCopy = useMemo(
    () => searchParams.get('info') || 'New artist accounts are still reviewed by Studio 201 after sign-in.',
    [searchParams]
  );

  useEffect(() => {
    if (authLoading || !session) {
      return;
    }

    const destination = resolveAuthorizedDestination(profile?.role, profile?.accountStatus);
    router.replace(destination ? `/auth/complete?next=${encodeURIComponent(destination)}` : '/auth/complete');
  }, [authLoading, profile?.accountStatus, profile?.role, router, session]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectToUrl = new URL('/auth/callback', window.location.origin);
      redirectToUrl.searchParams.set('app_origin', window.location.origin);

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectToUrl.toString(),
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start Google sign-in.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] px-4 font-karla">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-playfair font-medium text-gray-900">
            Sign in to Studio 201
          </h2>
          <p className="mt-4 text-center text-sm leading-6 text-gray-600">
            Keep it simple. Sign in with Google and we will route you based on your approval status.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {visibleError && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md text-center">
              {visibleError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || authLoading}
            className="flex w-full items-center justify-center gap-3 border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-700">
              G
            </span>
            <span className="font-dm-mono text-xs uppercase tracking-[0.14em]">
              {loading ? 'Opening Google...' : authLoading ? 'Checking session...' : 'Continue with Google'}
            </span>
          </button>

          <div className="border border-gray-100 bg-[#faf7f1] p-4 text-sm leading-6 text-gray-600">
            {helperCopy}
          </div>
          
        </div>
      </div>
    </div>
  );
}
