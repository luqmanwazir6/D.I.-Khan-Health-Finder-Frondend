import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { CATEGORIES_DATA } from '@/constants/data';

const ALL_SERVICES = CATEGORIES_DATA.flatMap((cat) =>
  cat.services.map((svc) => ({
    ...svc,
    categoryName: cat.name,
    categorySlug: cat.slug,
  })),
);

/**
 * Service module for Services.
 * Shared API Contract:
 * GET /api/v1/services
 * GET /api/v1/services/:id
 */
export const serviceService = {
  async getServices(params = {}) {
    try {
      const response = await axiosClient.get(ENDPOINTS.SERVICES.ROOT, { params });
      return response.data;
    } catch {
      let filtered = [...ALL_SERVICES];
      if (params.category) {
        filtered = filtered.filter(
          (s) => s.categoryId === params.category || s.categorySlug === params.category,
        );
      }
      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query),
        );
      }
      return {
        success: true,
        message: 'Services fetched successfully',
        data: filtered,
        pagination: {
          page: 1,
          limit: filtered.length,
          total: filtered.length,
          totalPages: 1,
        },
      };
    }
  },

  async getServiceByIdOrSlug(idOrSlug) {
    try {
      const response = await axiosClient.get(ENDPOINTS.SERVICES.BY_ID(idOrSlug));
      return response.data;
    } catch {
      const service = ALL_SERVICES.find(
        (s) => s.id === idOrSlug || s.slug === idOrSlug,
      );
      if (!service) {
        throw new Error('Service not found');
      }
      return {
        success: true,
        message: 'Service fetched successfully',
        data: service,
      };
    }
  },
};
