import { apiClient } from '@/lib/apiClient';
import { getCached, setCached } from '@/lib/cache';

export interface PublicUserProfile {
  id: string;
  email: string;
  fullName: string;
  slug: string;
  role: string;
  artistRank?: number | null;
  bio?: string;
  profileImageUrl?: string;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  createdAt: string;
}

export function sortPublicArtists(artists: PublicUserProfile[]) {
  return [...artists].sort((left, right) => {
    const leftRank = left.artistRank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = right.artistRank ?? Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }

    return left.fullName.localeCompare(right.fullName);
  });
}

export const artistService = {
  getArtists: async (): Promise<PublicUserProfile[]> => {
    const cached = getCached<PublicUserProfile[]>('artists:public');
    if (cached) return cached;
    const data = sortPublicArtists(await apiClient<PublicUserProfile[]>('/Profile/artists'));
    setCached('artists:public', data, 60_000);
    return data;
  },
  getArtistBySlug: async (slug: string): Promise<PublicUserProfile> => {
    return apiClient<PublicUserProfile>(`/Profile/artists/${slug}`);
  },
};
