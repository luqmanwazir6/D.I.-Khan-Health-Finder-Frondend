import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';

export const adminService = {
  async getStats() {
    const response = await axiosClient.get(ENDPOINTS.USERS.ADMIN_STATS);
    return response.data;
  },

  async getUsers(role = 'all') {
    const params = role !== 'all' ? { role } : {};
    const response = await axiosClient.get(ENDPOINTS.USERS.ROOT, { params });
    return response.data;
  },

  async approveProvider(providerId) {
    const response = await axiosClient.patch(ENDPOINTS.PROVIDERS.BY_ID(providerId), {
      status: 'active',
      isVerified: true,
      action: 'approve',
    });
    return response.data;
  },

  async rejectProvider(providerId, rejectionReason = '') {
    const response = await axiosClient.patch(ENDPOINTS.PROVIDERS.BY_ID(providerId), {
      status: 'rejected',
      isVerified: false,
      rejectionReason,
      action: 'reject',
    });
    return response.data;
  },

  async assignRequest(requestId, providerId) {
    const response = await axiosClient.patch(ENDPOINTS.REQUESTS.BY_ID(requestId), {
      providerId,
    });
    return response.data;
  },

  async updateRequestStatus(requestId, status, note = '') {
    const response = await axiosClient.patch(ENDPOINTS.REQUESTS.BY_ID(requestId), {
      status,
      statusNote: note,
    });
    return response.data;
  },
};
