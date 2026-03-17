import { apiClient } from '@/lib/apiClient';
import { getCached, setCached } from '@/lib/cache';

export interface PublicUserProfile {
  id: string;
  email: string;
  fullName: string;
  slug: string;
  role: string;
  bio?: string;
  profileImageUrl?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  createdAt: string;
}

export const artistService = {
  getArtists: async (): Promise<PublicUserProfile[]> => {
    const cached = getCached<PublicUserProfile[]>('artists:public');
    if (cached) return cached;
    const data = await apiClient<PublicUserProfile[]>('/Profile/artists');
    setCached('artists:public', data, 60_000);
    return data;
  },
  getArtistBySlug: async (slug: string): Promise<PublicUserProfile> => {
    return apiClient<PublicUserProfile>(`/Profile/artists/${slug}`);
  },
};
