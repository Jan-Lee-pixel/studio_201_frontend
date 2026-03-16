import { apiClient } from '@/lib/apiClient';

export interface PublicArtworkDto {
  id: string;
  exhibitionId: string;
  artistId: string;
  title: string;
  description: string;
  status: string;
  mediaAssetId: string | null;
  mediaAssetUrl?: string | null;
  createdAt: string;
}

export const artworkService = {
  getApprovedArtworksByExhibition: async (exhibitionId: string): Promise<PublicArtworkDto[]> => {
    return apiClient<PublicArtworkDto[]>(`/ArtworkSubmissions/public/exhibition/${exhibitionId}`);
  }
};
