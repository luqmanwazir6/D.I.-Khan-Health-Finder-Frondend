import { ROLES } from './roles';

/**
 * Route paths. Always reference these instead of hardcoding strings so a
 * path change is a one-line edit.
 */
export const ROUTES = Object.freeze({
  HOME: '/',

  SERVICES: '/services',
  SERVICE_DETAILS: '/services/:slug',

  PROVIDERS: '/providers',
  PROVIDER_DETAILS: '/providers/:id',

  SEARCH: '/search',

  NEW_REQUEST: '/requests/new',

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  CUSTOMER_DASHBOARD: '/dashboard/customer',
  PROVIDER_DASHBOARD: '/dashboard/provider',
  ADMIN_DASHBOARD: '/dashboard/admin',
});

/** Builders for parameterised paths. Values are URL-encoded. */
export const buildPath = Object.freeze({
  serviceDetails: (slug) => `/services/${encodeURIComponent(slug)}`,
  providerDetails: (id) => `/providers/${encodeURIComponent(id)}`,
});

export const DASHBOARD_PATH_BY_ROLE = Object.freeze({
  [ROLES.CUSTOMER]: ROUTES.CUSTOMER_DASHBOARD,
  [ROLES.PROVIDER]: ROUTES.PROVIDER_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
});

export const getDashboardPath = (role) => DASHBOARD_PATH_BY_ROLE[role] ?? ROUTES.HOME;
