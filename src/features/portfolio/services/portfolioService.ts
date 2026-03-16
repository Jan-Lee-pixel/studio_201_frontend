import { apiClient } from '@/lib/apiClient';

export interface PortfolioItem {
  id: string;
  artistId: string;
  title: string;
  description?: string | null;
  year?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  isPublic: boolean;
  mediaAssetId?: string | null;
  mediaAssetUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreatePortfolioItemPayload {
  title: string;
  description?: string | null;
  year?: string | null;
  medium?: string | null;
  dimensions?: string | null;
  isPublic?: boolean;
  mediaAssetId?: string | null;
}

export const portfolioService = {
  async getMyPortfolio(token?: string): Promise<PortfolioItem[]> {
    return apiClient<PortfolioItem[]>('/Portfolio', {}, token);
  },
  async getPublicPortfolioByArtist(artistId: string): Promise<PortfolioItem[]> {
    return apiClient<PortfolioItem[]>(`/Portfolio/artist/${artistId}`);
  },
  async createPortfolioItem(payload: CreatePortfolioItemPayload, token?: string): Promise<PortfolioItem> {
    return apiClient<PortfolioItem>('/Portfolio', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token);
  },
  async updatePortfolioItem(id: string, payload: Partial<CreatePortfolioItemPayload>, token?: string): Promise<PortfolioItem> {
    return apiClient<PortfolioItem>(`/Portfolio/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token);
  },
  async deletePortfolioItem(id: string, token?: string): Promise<void> {
    await apiClient(`/Portfolio/${id}`, { method: 'DELETE' }, token);
  },
};
