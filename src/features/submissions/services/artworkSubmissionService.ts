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
  isVisibleInExhibition: boolean;
  displayOrder?: number | null;
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

export interface CurateSubmissionPayload {
  exhibitionId?: string;
  isVisibleInExhibition?: boolean;
  displayOrder?: number | null;
}

export const artworkSubmissionService = {
  /**
   * Artist: Fetch all of the current artist's submissions
   */
  async getMySubmissions(token?: string): Promise<ArtworkSubmission[]> {
    return apiClient<ArtworkSubmission[]>('/artworksubmissions/me', {}, token);
  },

  async getSubmissionsByExhibition(exhibitionId: string, token?: string): Promise<ArtworkSubmission[]> {
    return apiClient<ArtworkSubmission[]>(`/artworksubmissions/exhibition/${exhibitionId}`, {}, token);
  },

  async getAllSubmissions(token?: string): Promise<ArtworkSubmission[]> {
    return apiClient<ArtworkSubmission[]>('/artworksubmissions/all', {}, token);
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
   * Artist: Delete a submission
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

  async updateCuration(
    id: string,
    payload: CurateSubmissionPayload,
    token?: string
  ): Promise<ArtworkSubmission> {
    return apiClient<ArtworkSubmission>(`/artworksubmissions/${id}/curation`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token);
  },
};
