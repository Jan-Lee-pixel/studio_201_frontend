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
   * Public: Fetches all approved exhibitions
   */
  async getExhibitions(): Promise<Exhibition[]> {
    return apiClient<Exhibition[]>('/Exhibitions');
  },

  /**
   * Public: Fetches a single exhibition by ID
   */
  async getExhibitionById(id: string): Promise<Exhibition> {
    return apiClient<Exhibition>(`/Exhibitions/${id}`);
  },

  /**
   * Public: Fetches a single exhibition by slug
   */
  async getExhibitionBySlug(slug: string): Promise<Exhibition> {
    return apiClient<Exhibition>(`/Exhibitions/slug/${slug}`);
  },

  /**
   * Admin Only: Creates a new exhibition
   */
  async createExhibition(payload: CreateExhibitionPayload): Promise<Exhibition> {
    return apiClient<Exhibition>('/Exhibitions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
