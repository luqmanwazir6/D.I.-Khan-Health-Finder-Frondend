import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import './RouteErrorBoundary.css';

// Raised when a lazily-loaded page chunk can't be fetched (offline, or a new
// deployment replaced the old files). A reload fixes it.
const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk .* failed/i;

/**
 * Rendered by React Router when a route throws during render or loading.
 * Ensures users always see a recoverable screen instead of a blank page.
 */
export default function RouteErrorBoundary() {
  const error = useRouteError();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const isChunkError = error instanceof Error && CHUNK_ERROR_PATTERN.test(error.message);

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while loading this page. Please try again.';

  if (isNotFound) {
    title = 'Page not found';
    message = "The page you're looking for doesn't exist or may have been moved.";
  } else if (isChunkError) {
    title = "This page couldn't load";
    message = 'Please check your internet connection and reload the page.';
  }

  useDocumentTitle(title);

  if (import.meta.env.DEV) {
    console.error('[RouteErrorBoundary]', error);
  }

  return (
    <section className="route-error container" aria-labelledby="route-error-title">
      <h1 id="route-error-title" className="route-error-title">
        {title}
      </h1>
      <p className="route-error-message">{message}</p>
      <div className="route-error-actions">
        {!isNotFound && (
          <button type="button" className="route-error-button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        )}
        <Link to={ROUTES.HOME} className="route-error-link">
          Go to homepage
        </Link>
      </div>
    </section>
  );
}
