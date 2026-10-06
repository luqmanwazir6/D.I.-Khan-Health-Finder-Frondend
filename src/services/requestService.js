import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { INITIAL_REQUESTS } from '@/constants/data';
import { REQUEST_STATUS } from '@/constants/requestStatus';
import { storage } from '@/utils/storage';

const REQUESTS_STORAGE_KEY = 'dikf_service_requests';

const getStoredRequests = () => {
  const local = storage.get(REQUESTS_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // invalid json, re-initialize
    }
  }
  storage.set(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
};

const saveStoredRequests = (list) => {
  storage.set(REQUESTS_STORAGE_KEY, JSON.stringify(list));
};

/**
 * Service module for Service Requests.
 * Shared API Contract:
 * GET /api/v1/requests
 * GET /api/v1/requests/:id
 * POST /api/v1/requests
 * PATCH /api/v1/requests/:id
 * PATCH /api/v1/requests/:id/cancel
 */
export const requestService = {
  async getRequests(params = {}) {
    try {
      const response = await axiosClient.get(ENDPOINTS.REQUESTS.ROOT, { params });
      return response.data;
    } catch {
      let list = getStoredRequests();
      if (params.customerId) {
        list = list.filter((r) => r.customerId === params.customerId);
      }
      if (params.providerId) {
        list = list.filter((r) => r.providerId === params.providerId);
      }
      if (params.status && params.status !== 'all') {
        list = list.filter((r) => r.status === params.status);
      }
      return {
        success: true,
        message: 'Requests fetched successfully',
        data: list,
      };
    }
  },

  async getRequestById(id) {
    try {
      const response = await axiosClient.get(ENDPOINTS.REQUESTS.BY_ID(id));
      return response.data;
    } catch {
      const list = getStoredRequests();
      const req = list.find((r) => r.id === id);
      if (!req) throw new Error('Request not found');
      return {
        success: true,
        message: 'Request fetched successfully',
        data: req,
      };
    }
  },

  async createRequest(requestData) {
    try {
      const response = await axiosClient.post(ENDPOINTS.REQUESTS.ROOT, requestData);
      return response.data;
    } catch {
      const list = getStoredRequests();
      const newRequest = {
        id: `req-${Date.now()}`,
        status: REQUEST_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        ...requestData,
      };
      list.unshift(newRequest);
      saveStoredRequests(list);
      return {
        success: true,
        message: 'Service request submitted successfully',
        data: newRequest,
      };
    }
  },

  async updateRequestStatus(id, newStatus) {
    try {
      const response = await axiosClient.patch(ENDPOINTS.REQUESTS.BY_ID(id), { status: newStatus });
      return response.data;
    } catch {
      const list = getStoredRequests();
      const idx = list.findIndex((r) => r.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: newStatus, updatedAt: new Date().toISOString() };
        saveStoredRequests(list);
        return {
          success: true,
          message: `Request status updated to ${newStatus}`,
          data: list[idx],
        };
      }
      throw new Error('Request not found');
    }
  },

  async cancelRequest(id, reason = '') {
    try {
      const response = await axiosClient.patch(ENDPOINTS.REQUESTS.CANCEL(id), { reason });
      return response.data;
    } catch {
      return this.updateRequestStatus(id, REQUEST_STATUS.CANCELLED);
    }
  },
};
