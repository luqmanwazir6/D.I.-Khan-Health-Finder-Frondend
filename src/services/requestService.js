import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { REQUEST_STATUS } from '@/constants/requestStatus';
import { storage } from '@/utils/storage';

const REQUESTS_STORAGE_KEY = 'dikf_service_requests';

const getStoredRequests = () => {
  const local = storage.get(REQUESTS_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // invalid json, return empty
    }
  }
  return [];
};

const saveStoredRequests = (list) => {
  storage.set(REQUESTS_STORAGE_KEY, JSON.stringify(list));
};

export const normalizeRequest = (r) => {
  if (!r) return null;
  const id = (r.id || r._id || '').toString();
  return {
    ...r,
    id,
    _id: (r._id || id).toString(),
    requestId: r.requestId || `REQ-${id.slice(-6).toUpperCase()}`,
    customerId: (r.customer?._id || r.customer?.id || r.customer || r.customerId || '').toString(),
    customerName: r.customer?.name || r.customerName || 'Customer',
    customerPhone: r.customer?.phone || r.customerPhone || '',
    customerEmail: r.customer?.email || r.customerEmail || '',
    providerId: r.provider?._id ? r.provider._id.toString() : (r.providerId || (typeof r.provider === 'string' ? r.provider : null)),
    providerName: r.provider?.name || r.providerName || null,
    providerPhone: r.provider?.phone || r.providerPhone || null,
    attachments: Array.isArray(r.attachments) ? r.attachments : [],
    statusHistory: Array.isArray(r.statusHistory) ? r.statusHistory : [],
    status: r.status || REQUEST_STATUS.PENDING,
    createdAt: r.createdAt || new Date().toISOString(),
  };
};

export const requestService = {
  async getRequests(params = {}) {
    try {
      const response = await axiosClient.get(ENDPOINTS.REQUESTS.ROOT, { params });
      const rawList = response.data?.data || [];
      const normalized = rawList.map(normalizeRequest);
      return {
        ...response.data,
        data: normalized,
      };
    } catch {
      // Local fallback: strictly filter by the authenticated user's role and identity
      let list = getStoredRequests().map(normalizeRequest);

      if (params.customerId || params.customerEmail) {
        list = list.filter((r) => {
          const matchId = params.customerId && (r.customerId === params.customerId || r.customer === params.customerId);
          const matchEmail = params.customerEmail && r.customerEmail && r.customerEmail.toLowerCase() === params.customerEmail.toLowerCase();
          return matchId || matchEmail;
        });
      } else if (params.providerId || params.providerEmail) {
        list = list.filter((r) => {
          const matchProId = params.providerId && (r.providerId === params.providerId || r.provider === params.providerId);
          const matchProEmail = params.providerEmail && r.providerEmail && r.providerEmail.toLowerCase() === params.providerEmail.toLowerCase();
          const matchOpenCategory = !r.providerId && params.category && r.category === params.category;
          return matchProId || matchProEmail || matchOpenCategory;
        });
      } else if (!params.isAdmin) {
        list = [];
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
    const targetId = id?._id || id?.id || id;
    try {
      const response = await axiosClient.get(ENDPOINTS.REQUESTS.BY_ID(targetId));
      const normalized = normalizeRequest(response.data?.data || response.data);
      return {
        ...response.data,
        data: normalized,
      };
    } catch {
      const list = getStoredRequests().map(normalizeRequest);
      const req = list.find((r) => r.id === targetId || r._id === targetId);
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
      const created = normalizeRequest(response.data?.data || response.data);
      const list = getStoredRequests();
      if (created) {
        list.unshift(created);
        saveStoredRequests(list);
      }
      return {
        success: true,
        message: response.data?.message || 'Service request submitted successfully',
        data: created,
      };
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message, { cause: err });
      }
      if (err.message && !err.message.includes('Network Error')) {
        throw err;
      }
      // Offline fallback only on genuine network failure
      const list = getStoredRequests();
      const newRequest = normalizeRequest({
        id: `req-${Date.now()}`,
        status: REQUEST_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        ...requestData,
      });
      list.unshift(newRequest);
      saveStoredRequests(list);
      return {
        success: true,
        message: 'Service request submitted (local session)',
        data: newRequest,
      };
    }
  },

  async updateRequestStatus(id, newStatus, extraData = {}) {
    const targetId = id?._id || id?.id || id;
    try {
      const response = await axiosClient.patch(ENDPOINTS.REQUESTS.BY_ID(targetId), {
        status: newStatus,
        ...extraData,
      });
      const updated = normalizeRequest(response.data?.data || response.data);
      const list = getStoredRequests();
      const idx = list.findIndex((r) => r.id === targetId || r._id === targetId);
      if (idx !== -1) {
        list[idx] = updated;
        saveStoredRequests(list);
      }
      return {
        success: true,
        message: response.data?.message || `Request status updated to ${newStatus}`,
        data: updated,
      };
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message, { cause: err });
      }
      const list = getStoredRequests();
      const idx = list.findIndex((r) => r.id === targetId || r._id === targetId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], status: newStatus, updatedAt: new Date().toISOString(), ...extraData };
        saveStoredRequests(list);
        return {
          success: true,
          message: `Request status updated to ${newStatus}`,
          data: list[idx],
        };
      }
      throw new Error(err.message || 'Failed to update request status', { cause: err });
    }
  },

  async cancelRequest(id, reason = '') {
    const targetId = id?._id || id?.id || id;
    try {
      const response = await axiosClient.patch(ENDPOINTS.REQUESTS.CANCEL(targetId), { reason });
      const updated = normalizeRequest(response.data?.data || response.data);
      const list = getStoredRequests();
      const idx = list.findIndex((r) => r.id === targetId || r._id === targetId);
      if (idx !== -1) {
        list[idx] = updated;
        saveStoredRequests(list);
      }
      return {
        success: true,
        message: 'Service request has been cancelled',
        data: updated,
      };
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message, { cause: err });
      }
      return this.updateRequestStatus(targetId, REQUEST_STATUS.CANCELLED);
    }
  },
};
