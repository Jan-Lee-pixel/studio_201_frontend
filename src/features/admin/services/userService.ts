import { apiClient } from '@/lib/apiClient';
import type { UserProfile } from '@/features/auth/services/authService';

export type UserRole = NonNullable<UserProfile["role"]>;
export type AccountStatus = UserProfile["accountStatus"];
export type UserAccessUpdate = {
  role?: UserRole;
  accountStatus?: AccountStatus;
};

export const userService = {
  async getAllUsers(): Promise<UserProfile[]> {
    return apiClient<UserProfile[]>('/Profile/all');
  },
  async updateUserAccess(id: string, update: UserAccessUpdate): Promise<UserProfile> {
    return apiClient<UserProfile>(`/Admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  },
};
