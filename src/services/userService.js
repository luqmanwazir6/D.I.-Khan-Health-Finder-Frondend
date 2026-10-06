import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { storage } from '@/utils/storage';

const USER_SESSION_KEY = 'dikf_user_session';

/**
 * Service module for User profile.
 * Shared API Contract:
 * GET /api/v1/users/profile
 * PATCH /api/v1/users/profile
 */
export const userService = {
  async getProfile() {
    try {
      const response = await axiosClient.get(ENDPOINTS.USERS.PROFILE);
      return response.data;
    } catch {
      const local = storage.get(USER_SESSION_KEY);
      if (local) {
        return {
          success: true,
          message: 'Profile fetched successfully',
          data: JSON.parse(local),
        };
      }
      throw new Error('Not authenticated');
    }
  },

  async updateProfile(updates) {
    try {
      const response = await axiosClient.patch(ENDPOINTS.USERS.PROFILE, updates);
      return response.data;
    } catch {
      const local = storage.get(USER_SESSION_KEY);
      if (local) {
        const current = JSON.parse(local);
        const updated = { ...current, ...updates };
        storage.set(USER_SESSION_KEY, JSON.stringify(updated));
        return {
          success: true,
          message: 'Profile updated successfully',
          data: updated,
        };
      }
      throw new Error('Not authenticated');
    }
  },
};
