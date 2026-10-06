/**
 * Runtime configuration derived from Vite environment variables.
 * Import from here instead of reading `import.meta.env` throughout the app.
 */
const env = import.meta.env;

const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';

if (env.DEV && !env.VITE_API_BASE_URL) {
  console.warn(
    `[config] VITE_API_BASE_URL is not set. Falling back to ${DEFAULT_API_BASE_URL}. ` +
      'Copy .env.example to .env to configure it.',
  );
}

export const APP_CONFIG = Object.freeze({
  appName: env.VITE_APP_NAME || 'D.I. Khan Service Finder',
  tagline: 'Find the Right Service, Near You.',
  // Strip trailing slashes so endpoint paths ("/providers") join cleanly.
  apiBaseUrl: (env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, ''),
  apiTimeout: Number(env.VITE_API_TIMEOUT) || 15000,
  defaultCity: env.VITE_DEFAULT_CITY || 'dera-ismail-khan',
  isDev: Boolean(env.DEV),
});
