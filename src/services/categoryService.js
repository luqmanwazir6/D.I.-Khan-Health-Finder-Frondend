import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { CATEGORIES_DATA } from '@/constants/data';

/**
 * Service module for Categories.
 * Shared API Contract:
 * GET /api/v1/categories
 * GET /api/v1/categories/:id
 */
export const categoryService = {
  async getCategories() {
    try {
      const response = await axiosClient.get(ENDPOINTS.CATEGORIES.ROOT);
      return response.data;
    } catch {
      // Fallback seed data for local preview / offline backend
      return {
        success: true,
        message: 'Categories fetched successfully',
        data: CATEGORIES_DATA,
      };
    }
  },

  async getCategoryByIdOrSlug(idOrSlug) {
    try {
      const response = await axiosClient.get(ENDPOINTS.CATEGORIES.BY_ID(idOrSlug));
      return response.data;
    } catch {
      const category = CATEGORIES_DATA.find(
        (c) => c.id === idOrSlug || c.slug === idOrSlug,
      );
      if (!category) {
        throw new Error('Category not found');
      }
      return {
        success: true,
        message: 'Category fetched successfully',
        data: category,
      };
    }
  },
};
