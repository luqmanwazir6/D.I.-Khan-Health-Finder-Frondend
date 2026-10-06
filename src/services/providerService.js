import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { INITIAL_PROVIDERS } from '@/constants/data';
import { storage } from '@/utils/storage';

const PROVIDERS_STORAGE_KEY = 'dikf_providers_data';

const getStoredProviders = () => {
  const local = storage.get(PROVIDERS_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // parse error, reset
    }
  }
  storage.set(PROVIDERS_STORAGE_KEY, JSON.stringify(INITIAL_PROVIDERS));
  return INITIAL_PROVIDERS;
};

/**
 * Service module for Providers.
 * Shared API Contract:
 * GET /api/v1/providers
 * GET /api/v1/providers/:id
 * POST /api/v1/providers
 * PATCH /api/v1/providers/:id
 * DELETE /api/v1/providers/:id
 */
export const providerService = {
  async getProviders(params = {}) {
    try {
      const response = await axiosClient.get(ENDPOINTS.PROVIDERS.ROOT, { params });
      return response.data;
    } catch {
      const providers = getStoredProviders();
      let filtered = [...providers];

      // 1. Keyword search (name, service, skills, description)
      if (params.q) {
        const query = params.q.toLowerCase().trim();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.service.toLowerCase().includes(query) ||
            p.shortDescription.toLowerCase().includes(query) ||
            p.skills.some((sk) => sk.toLowerCase().includes(query)),
        );
      }

      // 2. Category filter
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter(
          (p) => p.categoryId === params.category || p.categoryName?.toLowerCase() === params.category.toLowerCase(),
        );
      }

      // 3. Subcategory / Service filter
      if (params.service && params.service !== 'all') {
        filtered = filtered.filter(
          (p) => p.serviceId === params.service || p.service.toLowerCase() === params.service.toLowerCase(),
        );
      }

      // 4. Area filter
      if (params.area && params.area !== 'all') {
        filtered = filtered.filter(
          (p) =>
            p.primaryArea?.toLowerCase() === params.area.toLowerCase() ||
            p.serviceAreas?.some((a) => a.toLowerCase().includes(params.area.toLowerCase())),
        );
      }

      // 5. Rating filter
      if (params.rating && Number(params.rating) > 0) {
        const minRating = Number(params.rating);
        filtered = filtered.filter((p) => p.rating >= minRating);
      }

      // 6. Verified filter
      if (params.verified === 'true' || params.verified === true) {
        filtered = filtered.filter((p) => p.isVerified);
      }

      // 7. Availability filter
      if (params.availability && params.availability !== 'all') {
        if (params.availability === 'today') {
          filtered = filtered.filter((p) => p.availability.toLowerCase().includes('today'));
        }
      }

      // 8. Sorting
      const sort = params.sort || 'rating';
      if (sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'experience') {
        filtered.sort((a, b) => b.experience - a.experience);
      } else if (sort === 'price_asc') {
        filtered.sort((a, b) => a.startingPrice - b.startingPrice);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.startingPrice - a.startingPrice);
      } else if (sort === 'reviews') {
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      }

      // Pagination
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 12;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      return {
        success: true,
        message: 'Providers fetched successfully',
        data: paginated,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
      };
    }
  },

  async getProviderById(id) {
    try {
      const response = await axiosClient.get(ENDPOINTS.PROVIDERS.BY_ID(id));
      return response.data;
    } catch {
      const providers = getStoredProviders();
      const provider = providers.find((p) => p.id === id);
      if (!provider) {
        throw new Error('Provider not found');
      }
      return {
        success: true,
        message: 'Provider fetched successfully',
        data: provider,
      };
    }
  },

  async updateProvider(id, updateData) {
    try {
      const response = await axiosClient.patch(ENDPOINTS.PROVIDERS.BY_ID(id), updateData);
      return response.data;
    } catch {
      const providers = getStoredProviders();
      const idx = providers.findIndex((p) => p.id === id);
      if (idx !== -1) {
        providers[idx] = { ...providers[idx], ...updateData };
        storage.set(PROVIDERS_STORAGE_KEY, JSON.stringify(providers));
        return {
          success: true,
          message: 'Provider profile updated successfully',
          data: providers[idx],
        };
      }
      throw new Error('Provider not found');
    }
  },
};
