import {
  AUTH_MESSAGES,
  resolveAuthorizedDestination,
} from "@/lib/auth/destinations";
import {
  copyResponseCookies,
  createRouteHandlerClient,
} from "@/lib/supabase/route-handler";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5203/api";

type EnsuredProfile = {
  role?: string | null;
  accountStatus?: string | null;
};

function resolveAppOrigin(requestUrl: URL) {
  const candidate = requestUrl.searchParams.get("app_origin");
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "";

  const allowedOrigins = new Set(
    [requestUrl.origin, configuredSiteUrl, "http://localhost:3000"].filter(Boolean)
  );

  if (candidate) {
    try {
      const parsed = new URL(candidate);
      if (allowedOrigins.has(parsed.origin)) {
        return parsed.origin;
      }
    } catch {
      // Ignore invalid override values and fall back to the request origin.
    }
  }

  return requestUrl.origin;
}

function buildRedirect(requestUrl: URL, pathname: string, search?: Record<string, string>) {
  const url = new URL(pathname, resolveAppOrigin(requestUrl));
  if (search) {
    Object.entries(search).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return NextResponse.redirect(url);
}

async function ensureProfile(accessToken: string, email?: string | null, fullName?: string | null) {
  const response = await fetch(`${API_BASE_URL}/profile/ensure`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email: email || undefined,
      fullName: fullName || undefined,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Failed to sync profile with server";
    try {
      const data = await response.json();
      message = data.detail || data.title || message;
    } catch {
      // Keep the fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<EnsuredProfile>;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const providerError =
    requestUrl.searchParams.get("error_description") ||
    requestUrl.searchParams.get("error");

  if (providerError) {
    return buildRedirect(requestUrl, "/login", { error: providerError });
  }

  if (!code) {
    return buildRedirect(requestUrl, "/login", { error: "Missing authentication code." });
  }

  const sessionResponse = new NextResponse(null, { status: 204 });
  const supabase = createRouteHandlerClient(request, sessionResponse);
  const {
    data: { session },
    error: exchangeError,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !session) {
    return buildRedirect(requestUrl, "/login", {
      error: exchangeError?.message || AUTH_MESSAGES.incompleteSignIn,
    });
  }

  const fullName =
    (session.user.user_metadata?.full_name as string | undefined) ||
    (session.user.user_metadata?.name as string | undefined) ||
    session.user.email ||
    "New User";

  let profile: EnsuredProfile;

  try {
    profile = await ensureProfile(session.access_token, session.user.email, fullName);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync profile with server";
    await supabase.auth.signOut();
    const redirectResponse = buildRedirect(requestUrl, "/login", { error: message });
    copyResponseCookies(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  const destination = resolveAuthorizedDestination(profile.role, profile.accountStatus);

  if (profile.accountStatus?.toLowerCase() === "rejected") {
    await supabase.auth.signOut();
    const redirectResponse = buildRedirect(requestUrl, "/login", {
      error: AUTH_MESSAGES.rejected,
    });
    copyResponseCookies(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  if (destination) {
    const redirectResponse = buildRedirect(requestUrl, "/auth/complete", { next: destination });
    copyResponseCookies(sessionResponse, redirectResponse);
    return redirectResponse;
  }

  await supabase.auth.signOut();
  const redirectResponse = buildRedirect(requestUrl, "/login", {
    error: AUTH_MESSAGES.awaitingApproval,
  });
  copyResponseCookies(sessionResponse, redirectResponse);
  return redirectResponse;
}
