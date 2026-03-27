export const PUBLIC_API_BASE_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5203/api";

const shouldBypassBuildCache =
  PUBLIC_API_BASE_URL.includes("localhost:") || PUBLIC_API_BASE_URL.includes("backend:8080");
const PUBLIC_FETCH_RETRY_DELAYS_MS = [450, 1200] as const;

type PublicFetchOptions = {
  revalidate?: number;
  tags?: string[];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryStatus = (status: number) => {
  if (status >= 500) return true;
  return status === 408 || status === 425 || status === 429;
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
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= PUBLIC_FETCH_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(
        `${PUBLIC_API_BASE_URL}${endpoint}`,
        getPublicFetchConfig({ revalidate, tags }),
      );

      if (!response.ok) {
        if (shouldRetryStatus(response.status) && attempt < PUBLIC_FETCH_RETRY_DELAYS_MS.length) {
          await sleep(PUBLIC_FETCH_RETRY_DELAYS_MS[attempt]);
          continue;
        }

        throw new Error(`Public API request failed for ${endpoint}: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < PUBLIC_FETCH_RETRY_DELAYS_MS.length) {
        await sleep(PUBLIC_FETCH_RETRY_DELAYS_MS[attempt]);
        continue;
      }
    }
  }

  throw lastError ?? new Error(`Public API request failed for ${endpoint}`);
}

export async function getPublicCollection<T>(
  endpoint: string,
  options?: PublicFetchOptions,
): Promise<T[]> {
  try {
    return await fetchPublic<T[]>(endpoint, options);
  } catch (error) {
    console.error(`[publicApi] Failed to load collection ${endpoint}`, error);
    return [];
  }
}

export async function getPublicResource<T>(
  endpoint: string,
  options?: PublicFetchOptions,
): Promise<T | null> {
  try {
    return await fetchPublic<T>(endpoint, options);
  } catch (error) {
    console.error(`[publicApi] Failed to load resource ${endpoint}`, error);
    return null;
  }
}
