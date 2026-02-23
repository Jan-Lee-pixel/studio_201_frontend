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
}

export interface CreateSubmissionPayload {
  exhibitionId: string;
  title: string;
  description?: string;
  mediaAssetId?: string; // Points to media_assets table from Supabase direct upload
}

export const artworkSubmissionService = {
  /**
   * Artist: Submit a new artwork to an exhibition
   */
  async submitArtwork(payload: CreateSubmissionPayload): Promise<ArtworkSubmission> {
    return apiClient<ArtworkSubmission>('/artworksubmissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch a specific submission
   */
  async getSubmission(id: string): Promise<ArtworkSubmission> {
    return apiClient<ArtworkSubmission>(`/artworksubmissions/${id}`);
  },

  /**
   * Admin Only: Approve a submission
   */
  async approveSubmission(id: string): Promise<{ message: string; id: string }> {
    return apiClient<{ message: string; id: string }>(`/artworksubmissions/${id}/approve`, {
      method: 'PUT',
    });
  },

  /**
   * Admin Only: Reject a submission
   */
  async rejectSubmission(id: string): Promise<{ message: string; id: string }> {
    return apiClient<{ message: string; id: string }>(`/artworksubmissions/${id}/reject`, {
      method: 'PUT',
    });
  },
};
