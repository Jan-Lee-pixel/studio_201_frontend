import { apiClient } from '@/lib/apiClient';

export interface ArtworkSubmission {
  id: string;
  exhibitionId: string;
  artistId: string;
  title: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  mediaAssetId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSubmissionPayload {
  exhibitionId: string;
  title: string;
  description?: string;
  mediaAssetId?: string;
}

export const artworkSubmissionService = {
  /**
   * Artist: Fetch all of the current artist's submissions
   */
  async getMySubmissions(token?: string): Promise<ArtworkSubmission[]> {
    return apiClient<ArtworkSubmission[]>('/artworksubmissions/me', {}, token);
  },

  /**
   * Artist: Submit a new artwork to an exhibition
   */
  async submitArtwork(payload: CreateSubmissionPayload, token?: string): Promise<ArtworkSubmission> {
    return apiClient<ArtworkSubmission>('/artworksubmissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token);
  },

  /**
   * Admin Only: Update submission status
   */
  async updateStatus(id: string, status: string, token?: string): Promise<ArtworkSubmission> {
    return apiClient<ArtworkSubmission>(`/artworksubmissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    }, token);
  },
};
