'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { resolveAuthorizedDestination } from '@/lib/auth/destinations';
import { createClient } from '@/lib/supabase/client';

const EMAIL_COOLDOWN_SECONDS = 60;

export default function LoginPage() {
  const router = useRouter();
  const { session, profile, loading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [codeVerifying, setCodeVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [emailStep, setEmailStep] = useState<'email' | 'code'>('email');
  const [searchFeedbackDismissed, setSearchFeedbackDismissed] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const searchParams = useSearchParams();
  const searchError = searchParams.get('error');
  const visibleError = error || (!searchFeedbackDismissed ? searchError : null);
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

  useEffect(() => {
    if (resendCountdown <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendCountdown]);

  const dismissSearchFeedback = () => {
    setSearchFeedbackDismissed(true);
  };

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const sendEmailCode = async (mode: 'send' | 'resend' = 'send') => {
    const normalizedEmail = email.trim().toLowerCase();

    dismissSearchFeedback();
    setError(null);
    setStatusMessage(null);

    if (!validateEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setEmailSending(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        throw otpError;
      }

      setEmail(normalizedEmail);
      setEmailStep('code');
      setCode('');
      setResendCountdown(EMAIL_COOLDOWN_SECONDS);
      setStatusMessage(
        mode === 'resend'
          ? `A fresh 6-digit code was sent to ${normalizedEmail}.`
          : `We sent a 6-digit code to ${normalizedEmail}.`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send the sign-in code.';
      setError(message);
    } finally {
      setEmailSending(false);
    }
  };

  const handleVerifyCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    dismissSearchFeedback();
    setError(null);
    setStatusMessage(null);

    if (!validateEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      setEmailStep('email');
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setCodeVerifying(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: normalizedCode,
        type: 'email',
      });

      if (verifyError) {
        throw verifyError;
      }

      setStatusMessage('Code accepted. Finishing sign-in...');
      router.replace('/auth/complete');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not verify the sign-in code.';
      setError(message);
    } finally {
      setCodeVerifying(false);
    }
  };

  const handleGoogleSignIn = async () => {
    dismissSearchFeedback();
    setGoogleLoading(true);
    setError(null);
    setStatusMessage(null);

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
        setGoogleLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start Google sign-in.';
      setError(message);
      setGoogleLoading(false);
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
            Keep it simple. Sign in with Google or use a code sent to your email, and we will
            route you based on your approval status.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {visibleError && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md text-center">
              {visibleError}
            </div>
          )}

          {statusMessage && (
            <div className="bg-[#faf7f1] text-gray-700 text-sm p-3 rounded-md text-center border border-[#ece6da]">
              {statusMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || authLoading || emailSending || codeVerifying}
            className="flex w-full items-center justify-center gap-3 border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold text-gray-700">
              G
            </span>
            <span className="font-dm-mono text-xs uppercase tracking-[0.14em]">
              {googleLoading
                ? 'Opening Google...'
                : authLoading
                  ? 'Checking session...'
                  : 'Continue with Google'}
            </span>
          </button>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            <span>Or use email code</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="space-y-4 border border-gray-100 bg-white p-5">
            <div className="space-y-2">
              <label className="block font-dm-mono text-[11px] uppercase tracking-[0.12em] text-gray-500">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  dismissSearchFeedback();
                  setEmail(event.target.value);
                }}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={emailSending || codeVerifying || authLoading}
                className="w-full border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-500 disabled:bg-gray-50"
              />
            </div>

            {emailStep === 'code' ? (
              <>
                <div className="space-y-2">
                  <label className="block font-dm-mono text-[11px] uppercase tracking-[0.12em] text-gray-500">
                    6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(event) => {
                      dismissSearchFeedback();
                      setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                    }}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    disabled={codeVerifying || authLoading}
                    className="w-full border border-gray-300 px-4 py-3 text-sm tracking-[0.3em] text-gray-900 outline-none transition-colors focus:border-gray-500 disabled:bg-gray-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={codeVerifying || authLoading || emailSending}
                  className="w-full border border-gray-900 bg-gray-900 px-4 py-3 font-dm-mono text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-black disabled:opacity-50"
                >
                  {codeVerifying ? 'Checking code...' : 'Continue with code'}
                </button>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      dismissSearchFeedback();
                      setEmailStep('email');
                      setCode('');
                      setStatusMessage(null);
                    }}
                    className="text-gray-500 underline-offset-4 transition-colors hover:text-gray-900 hover:underline"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendEmailCode('resend')}
                    disabled={emailSending || resendCountdown > 0 || authLoading || codeVerifying}
                    className="text-gray-500 underline-offset-4 transition-colors hover:text-gray-900 hover:underline disabled:no-underline disabled:opacity-50"
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void sendEmailCode('send')}
                disabled={emailSending || authLoading || googleLoading}
                className="w-full border border-gray-900 bg-gray-900 px-4 py-3 font-dm-mono text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-black disabled:opacity-50"
              >
                {emailSending ? 'Sending code...' : 'Send email code'}
              </button>
            )}
          </div>

          <div className="border border-gray-100 bg-[#faf7f1] p-4 text-sm leading-6 text-gray-600">
            {helperCopy}
          </div>
        </div>
      </div>
    </div>
  );
}
