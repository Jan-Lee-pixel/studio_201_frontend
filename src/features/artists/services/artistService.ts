import { apiClient } from '@/lib/apiClient';

export interface PublicUserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export const artistService = {
  getArtists: async (): Promise<PublicUserProfile[]> => {
    return apiClient<PublicUserProfile[]>('/Profile/artists');
  }
};
