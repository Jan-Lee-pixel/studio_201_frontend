export const PUBLIC_API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5203/api";

const shouldBypassBuildCache =
  PUBLIC_API_BASE_URL.includes("localhost:") || PUBLIC_API_BASE_URL.includes("backend:8080");

type PublicFetchOptions = {
  revalidate?: number;
  tags?: string[];
};

export function getPublicFetchConfig({
  revalidate = 300,
  tags = [],
}: PublicFetchOptions = {}) {
  if (shouldBypassBuildCache) {
    return { cache: "no-store" as const };
  }

  return {
    next: {
      revalidate,
      tags,
    },
  };
}

async function fetchPublic<T>(
  endpoint: string,
  { revalidate = 300, tags = [] }: PublicFetchOptions = {},
): Promise<T> {
  const response = await fetch(
    `${PUBLIC_API_BASE_URL}${endpoint}`,
    getPublicFetchConfig({ revalidate, tags }),
  );

  if (!response.ok) {
    throw new Error(`Public API request failed for ${endpoint}: ${response.status}`);
  }

  return response.json();
}

export async function getPublicCollection<T>(
  endpoint: string,
  options?: PublicFetchOptions,
): Promise<T[]> {
  try {
    return await fetchPublic<T[]>(endpoint, options);
  } catch {
    return [];
  }
}

export async function getPublicResource<T>(
  endpoint: string,
  options?: PublicFetchOptions,
): Promise<T | null> {
  try {
    return await fetchPublic<T>(endpoint, options);
  } catch {
    return null;
  }
}
