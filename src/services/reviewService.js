import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';
import { INITIAL_REVIEWS } from '@/constants/data';
import { storage } from '@/utils/storage';

const REVIEWS_STORAGE_KEY = 'dikf_reviews_data';

const getStoredReviews = () => {
  const local = storage.get(REVIEWS_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // parse error
    }
  }
  storage.set(REVIEWS_STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
};

const saveStoredReviews = (list) => {
  storage.set(REVIEWS_STORAGE_KEY, JSON.stringify(list));
};

/**
 * Service module for Reviews.
 * Shared API Contract:
 * GET /api/v1/reviews
 * POST /api/v1/reviews
 * PATCH /api/v1/reviews/:id
 * DELETE /api/v1/reviews/:id
 */
export const reviewService = {
  async getReviews(params = {}) {
    try {
      const response = await axiosClient.get(ENDPOINTS.REVIEWS.ROOT, { params });
      return response.data;
    } catch {
      let list = getStoredReviews();
      if (params.providerId) {
        list = list.filter((r) => r.providerId === params.providerId);
      }
      return {
        success: true,
        message: 'Reviews fetched successfully',
        data: list,
      };
    }
  },

  async createReview(reviewData) {
    try {
      const response = await axiosClient.post(ENDPOINTS.REVIEWS.ROOT, reviewData);
      return response.data;
    } catch {
      const list = getStoredReviews();
      const newReview = {
        id: `rev-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ...reviewData,
      };
      list.unshift(newReview);
      saveStoredReviews(list);
      return {
        success: true,
        message: 'Review submitted successfully',
        data: newReview,
      };
    }
  },
};
