'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { PublicSurface } from '@/components/ui/PublicPagePrimitives';
import { useAuth } from '@/providers/AuthProvider';
import { resolveAuthorizedDestination } from '@/lib/auth/destinations';
import { createClient } from '@/lib/supabase/client';

const EMAIL_COOLDOWN_SECONDS = 60;

const inputClass =
  'w-full rounded-[16px] border border-[var(--color-rule)] bg-[rgba(246,243,238,0.88)] px-4 py-3 text-sm text-[var(--color-near-black)] outline-none transition-colors focus:border-[var(--color-sienna)] focus:bg-white';
const secondaryButtonClass =
  'inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full border border-[var(--color-rule)] bg-white px-4 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-near-black)] transition-colors duration-300 hover:border-[var(--color-near-black)] hover:bg-[var(--color-bone)] disabled:opacity-50';
const primaryButtonClass =
  'inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-[var(--color-near-black)] bg-[var(--color-near-black)] px-4 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-cream)] transition-colors duration-300 hover:bg-[var(--color-charcoal)] disabled:opacity-50';

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
    [searchParams],
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
          : `We sent a 6-digit code to ${normalizedEmail}.`,
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf6ef_0%,var(--color-parchment)_36%,var(--color-bone)_100%)] pt-28">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 pb-16 md:px-12 md:pb-24 xl:grid-cols-[minmax(0,0.84fr)_minmax(360px,0.96fr)] xl:gap-10">
        <div className="order-2 flex flex-col justify-between gap-8 xl:order-1 xl:gap-10">
          <div>
            <SectionLabel>Portal Access</SectionLabel>
            <h1 className="mt-0 max-w-[10ch] font-display text-[clamp(40px,11vw,104px)] leading-[0.9] tracking-[-0.06em] text-[var(--color-near-black)] md:max-w-[11ch] md:leading-[0.86]">
              Sign in to Studio 201.
            </h1>
            <p className="mt-5 max-w-[56ch] text-[15px] leading-7 text-[var(--color-warm-slate)] md:mt-6 md:leading-8">
              Sign in with Google or a one-time email code. Approved users are routed directly to the correct portal.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)] transition-colors duration-200 hover:text-[var(--color-near-black)]"
              >
                Return to public site
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[var(--color-rule)] pt-5 sm:flex sm:flex-wrap sm:gap-x-8 sm:pt-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Sign-in</div>
              <div className="mt-2 text-sm text-[var(--color-near-black)]">Google or email code</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">Artist access</div>
              <div className="mt-2 text-sm text-[var(--color-near-black)]">Approved after review</div>
            </div>
          </div>
        </div>

        <PublicSurface className="order-1 overflow-hidden xl:order-2">
          <div className="p-6 md:p-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-sienna)]">
              Portal sign-in
            </div>
            <h2 className="mt-5 font-display text-[clamp(30px,8vw,54px)] leading-[0.94] tracking-[-0.05em] text-[var(--color-near-black)]">
              Continue into the workspace.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-warm-slate)]">{helperCopy}</p>

            <div className="mt-8 space-y-4">
              {visibleError ? (
                <div className="rounded-[18px] border border-[rgba(181,96,58,0.22)] bg-[rgba(181,96,58,0.08)] px-4 py-3 text-sm text-[#9f4c2d]">
                  {visibleError}
                </div>
              ) : null}

              {statusMessage ? (
                <div className="rounded-[18px] border border-[var(--color-rule)] bg-[rgba(250,248,244,0.78)] px-4 py-3 text-sm text-[var(--color-warm-slate)]">
                  {statusMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || authLoading || emailSending || codeVerifying}
                className={secondaryButtonClass}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-rule)] text-[11px] font-semibold text-[var(--color-warm-slate)]">
                  G
                </span>
                <span>
                  {googleLoading
                    ? 'Opening Google...'
                    : authLoading
                      ? 'Checking session...'
                      : 'Continue with Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-[var(--color-dust)]">
                <span className="h-px flex-1 bg-[var(--color-rule)]" />
                <span>Or use email code</span>
                <span className="h-px flex-1 bg-[var(--color-rule)]" />
              </div>

              <div className="space-y-4 rounded-[24px] border border-[var(--color-rule)] bg-[rgba(250,248,244,0.72)] p-5">
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
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
                    className={inputClass}
                  />
                </div>

                {emailStep === 'code' ? (
                  <>
                    <div className="space-y-2">
                      <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-dust)]">
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
                        className={`${inputClass} tracking-[0.3em]`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={codeVerifying || authLoading || emailSending}
                      className={primaryButtonClass}
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
                        className="text-[var(--color-warm-slate)] underline-offset-4 transition-colors hover:text-[var(--color-near-black)] hover:underline"
                      >
                        Change email
                      </button>
                      <button
                        type="button"
                        onClick={() => void sendEmailCode('resend')}
                        disabled={emailSending || resendCountdown > 0 || authLoading || codeVerifying}
                        className="text-[var(--color-warm-slate)] underline-offset-4 transition-colors hover:text-[var(--color-near-black)] hover:underline disabled:no-underline disabled:opacity-50"
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
                    className={primaryButtonClass}
                  >
                    {emailSending ? 'Sending code...' : 'Send email code'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </PublicSurface>
      </div>
    </div>
  );
}
