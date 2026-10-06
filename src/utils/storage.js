/**
 * Safe wrappers around localStorage. Access can throw in private browsing
 * modes or when storage is disabled, so every call is guarded.
 */
const STORAGE_PREFIX = 'dikf';

export const STORAGE_KEYS = Object.freeze({
  TOKEN: `${STORAGE_PREFIX}.token`,
});

export const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage unavailable — nothing to remove */
    }
  },
};

/** JWT access token used for the `Authorization: Bearer <token>` header. */
export const tokenStorage = {
  get: () => storage.get(STORAGE_KEYS.TOKEN),
  set: (token) => storage.set(STORAGE_KEYS.TOKEN, token),
  clear: () => storage.remove(STORAGE_KEYS.TOKEN),
};
