import { apiClient } from '@/lib/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Artist';
  createdAt: string;
}

export const authService = {
  /**
   * Fetches the current user's profile from the .NET backend.
   * If the user doesn't exist in the Postgres DB, the backend creates them as an Artist.
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient<UserProfile>('/profile');
  },
};
