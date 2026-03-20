import { apiClient } from '@/lib/apiClient';

export interface ArtworkSubmission {
  id: string;
  exhibitionId: string;
  artistId: string;
  title: string;
  category?: string | null;
  artType?: string | null;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  mediaAssetId?: string;
  mediaAssetUrl?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSubmissionPayload {
  exhibitionId: string;
  title: string;
  category?: string | null;
  artType?: string | null;
  description?: string;
  mediaAssetId?: string;
}

export interface UpdateSubmissionPayload {
  exhibitionId?: string;
  title?: string;
  category?: string | null;
  artType?: string | null;
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
   * Artist: Update a pending submission
   */
  async updateSubmission(
    id: string,
    payload: UpdateSubmissionPayload,
    token?: string
  ): Promise<ArtworkSubmission> {
    return apiClient<ArtworkSubmission>(`/artworksubmissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token);
  },

  /**
   * Artist: Delete a non-approved submission
   */
  async deleteSubmission(id: string, token?: string): Promise<void> {
    await apiClient(`/artworksubmissions/${id}`, { method: 'DELETE' }, token);
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
