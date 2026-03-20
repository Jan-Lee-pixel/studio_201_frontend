export const AUTH_MESSAGES = {
  awaitingApproval: "Your account is awaiting approval. Please check back later.",
  incompleteSignIn: "Could not complete sign in.",
  rejected:
    "Your application was not approved. Please contact Studio 201 for assistance.",
} as const;

export function resolveAuthorizedDestination(
  role?: string | null,
  accountStatus?: string | null
) {
  const normalizedStatus = accountStatus?.toLowerCase();
  const normalizedRole = role?.toLowerCase();

  if (normalizedStatus === "pending") {
    return "/pending";
  }

  if (normalizedStatus === "approved" && normalizedRole === "admin") {
    return "/admin";
  }

  if (normalizedStatus === "approved" && normalizedRole === "artist") {
    return "/artist/dashboard";
  }

  return null;
}

export function isSafeRelativePath(value?: string | null): value is string {
  return Boolean(value && value.startsWith("/"));
}
