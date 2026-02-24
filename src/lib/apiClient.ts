import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5203/api';

/**
 * An authenticated fetch wrapper.
 * Automatically injects the Supabase JWT token into the Authorization header.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  overrideToken?: string
): Promise<T> {
  let token = overrideToken;

  // If no token was explicitly provided, fetch the latest session
  if (!token && typeof window !== 'undefined') {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
      }
    } catch (e) {
      console.warn('apiClient: Failed to fetch session from Supabase', e);
    }
  }

  const headers = new Headers(options.headers || {});
  
  // Set default JSON content type if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject JWT if found
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.title || response.statusText;
    } catch {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // If response is 204 No Content, we don't return json
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
