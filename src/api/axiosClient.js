import axios from 'axios';
import { APP_CONFIG } from '@/constants/config';
import { tokenStorage } from '@/utils/storage';
import { normalizeApiError } from '@/utils/apiError';

/**
 * The single Axios instance for the whole app. Components never import axios
 * directly — they call service modules in `src/services`, which use this.
 *
 * Content-Type is intentionally not hardcoded: Axios sets JSON for plain
 * objects and multipart boundaries for FormData (image uploads) automatically.
 */
const axiosClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: APP_CONFIG.apiTimeout,
  headers: { Accept: 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Optional global 401 handler (registered by the auth layer) so an expired
 * session logs the user out consistently, wherever the call was made.
 */
let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
};

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = normalizeApiError(error);
    if (apiError.isUnauthorized && unauthorizedHandler) {
      unauthorizedHandler(apiError);
    }
    return Promise.reject(apiError);
  },
);

export default axiosClient;
