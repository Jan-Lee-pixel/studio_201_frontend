import { apiClient } from '@/lib/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  slug?: string;
  role?: 'admin' | 'artist' | null;
  accountStatus: 'pending' | 'approved' | 'rejected';
  bio?: string;
  profileImageUrl?: string;
  createdAt: string;
}

export const authService = {
  /**
   * Fetches the current user's profile from the backend.
   */
  async getProfile(token?: string): Promise<UserProfile> {
    return apiClient<UserProfile>('/profile/me', {}, token);
  },
  /**
   * Ensures the current user exists in the backend DB.
   */
  async ensureProfile(payload: { email?: string; fullName?: string }, token?: string): Promise<UserProfile> {
    return apiClient<UserProfile>('/profile/ensure', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token);
  },
  /**
   * Updates the current user's profile fields.
   */
  async updateProfile(payload: { bio?: string; profileImageUrl?: string; slug?: string; fullName?: string }, token?: string): Promise<UserProfile> {
    return apiClient<UserProfile>('/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token);
  },
};
