import { useEffect } from 'react';
import { APP_CONFIG } from '@/constants/config';

/**
 * Sets the browser tab title for the current page.
 * @param {string} [title] Page-specific title. Omit for the default site title.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} | ${APP_CONFIG.appName}`
      : `${APP_CONFIG.appName} — ${APP_CONFIG.tagline.replace(/\.$/, '')}`;
  }, [title]);
}
