import { apiClient } from '@/lib/apiClient';

export interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isFeatured: boolean;
  coverImageUrl?: string;
  createdBy?: string;
}

export interface CreateExhibitionPayload {
  title: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  coverMediaId?: string;
}

export const exhibitionService = {
  /**
   * Public: Fetches all exhibitions
   */
  async getExhibitions(): Promise<Exhibition[]> {
    return apiClient<Exhibition[]>('/exhibitions');
  },

  /**
   * Admin Only: Creates a new exhibition
   */
  async createExhibition(payload: CreateExhibitionPayload): Promise<Exhibition> {
    return apiClient<Exhibition>('/exhibitions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
