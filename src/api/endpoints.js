/**
 * Backend endpoint paths, relative to VITE_API_BASE_URL (which already
 * includes the `/api/v1` prefix). Mirrors the shared API contract exactly.
 */
const id = (value) => encodeURIComponent(value);

export const ENDPOINTS = Object.freeze({
  AUTH: Object.freeze({
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  }),

  PROVIDERS: Object.freeze({
    ROOT: '/providers',
    BY_ID: (providerId) => `/providers/${id(providerId)}`,
  }),

  SERVICES: Object.freeze({
    ROOT: '/services',
    BY_ID: (serviceId) => `/services/${id(serviceId)}`,
  }),

  CATEGORIES: Object.freeze({
    ROOT: '/categories',
    BY_ID: (categoryId) => `/categories/${id(categoryId)}`,
  }),

  REQUESTS: Object.freeze({
    ROOT: '/requests',
    BY_ID: (requestId) => `/requests/${id(requestId)}`,
    CANCEL: (requestId) => `/requests/${id(requestId)}/cancel`,
  }),

  REVIEWS: Object.freeze({
    ROOT: '/reviews',
    BY_ID: (reviewId) => `/reviews/${id(reviewId)}`,
  }),

  USERS: Object.freeze({
    ROOT: '/users',
    PROFILE: '/users/profile',
    ADMIN_STATS: '/users/admin/stats',
  }),

  UPLOAD: Object.freeze({
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',
  }),

  NOTIFICATIONS: Object.freeze({
    ROOT: '/notifications',
    MARK_READ: (notifId) => `/notifications/${id(notifId)}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  }),
});
