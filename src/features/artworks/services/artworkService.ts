import { apiClient } from '@/lib/apiClient';

export interface PublicArtworkDto {
  id: string;
  exhibitionId: string;
  artistId: string;
  title: string;
  description: string;
  status: string;
  mediaAssetId: string | null;
  createdAt: string;
}

export const artworkService = {
  getApprovedArtworksByExhibition: async (exhibitionId: string): Promise<PublicArtworkDto[]> => {
    // Re-using the admin endpoint for now, but in reality we should have a public endpoint that only returns Approved items.
    // As a workaround for the current architecture, we will fetch and filter on the client, or use the existing endpoint.
    // Fetching from the existing endpoint:
    const allExhibitionSubmissions = await apiClient<PublicArtworkDto[]>(`/ArtworkSubmissions/exhibition/${exhibitionId}`);
    return allExhibitionSubmissions.filter(s => s.status === 'Approved');
  }
};
