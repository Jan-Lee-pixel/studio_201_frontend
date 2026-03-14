import { apiClient } from '@/lib/apiClient';
import { getCached, setCached } from '@/lib/cache';

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
    const cached = getCached<Exhibition[]>('exhibitions:approved');
    if (cached) return cached;
    const data = await apiClient<Exhibition[]>('/Exhibitions');
    setCached('exhibitions:approved', data, 60_000);
    return data;
  },

  /**
   * Public: Fetches archived exhibitions (past shows)
   */
  async getArchiveExhibitions(): Promise<Exhibition[]> {
    const cached = getCached<Exhibition[]>('exhibitions:archive');
    if (cached) return cached;
    const data = await apiClient<Exhibition[]>('/Exhibitions/archive');
    setCached('exhibitions:archive', data, 60_000);
    return data;
  },
  /**
   * Public: Fetches exhibitions open for submissions (current + upcoming)
   */
  async getOpenExhibitions(): Promise<Exhibition[]> {
    const cached = getCached<Exhibition[]>('exhibitions:open');
    if (cached) return cached;
    const data = await apiClient<Exhibition[]>('/Exhibitions/open');
    setCached('exhibitions:open', data, 60_000);
    return data;
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
   * Admin Only: Fetch all exhibitions
   */
  async getAllExhibitions(): Promise<Exhibition[]> {
    return apiClient<Exhibition[]>('/Exhibitions/all');
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
