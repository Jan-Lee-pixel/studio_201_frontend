import { apiClient } from '@/lib/apiClient';

export interface AdminStats {
  pendingSubmissions: number;
  activeExhibitions: number;
  totalUsers: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    return apiClient<AdminStats>('/Admin/stats');
  }
};
