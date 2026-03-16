import { apiClient } from '@/lib/apiClient';

export interface MediaAssetDto {
  id: string;
  fileName: string;
  filePath: string;
  publicUrl: string;
  mediaType: string;
  altText?: string | null;
  createdAt: string;
}

export interface CreateMediaAssetPayload {
  fileName: string;
  filePath: string;
  publicUrl: string;
  mediaType: string;
  altText?: string;
}

export const mediaAssetService = {
  async createAsset(payload: CreateMediaAssetPayload, token?: string): Promise<MediaAssetDto> {
    return apiClient<MediaAssetDto>('/MediaAssets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token);
  },
};
