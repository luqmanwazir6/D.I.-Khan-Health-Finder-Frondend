import { FaSearch, FaExclamationTriangle, FaCheckCircle, FaRedo } from 'react-icons/fa';
import Button from './Button';
import './FeedbackStates.css';

/**
 * Empty state display when no results or items exist.
 */
export function EmptyState({
  icon = <FaSearch />,
  title = 'No items found',
  message = 'Try adjusting your search criteria or filters to find what you are looking for.',
  actionLabel = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`feedback-state empty-state ${className}`} role="status">
      <div className="feedback-icon-box" aria-hidden="true">
        {icon}
      </div>
      <h3 className="feedback-title">{title}</h3>
      <p className="feedback-message">{message}</p>
      {actionLabel && onAction && (
        <div className="feedback-actions">
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Error state display when API or request fails.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this data. Please try again.',
  onRetry = null,
  className = '',
}) {
  return (
    <div className={`feedback-state error-state ${className}`} role="alert">
      <div className="feedback-icon-box error-icon-box" aria-hidden="true">
        <FaExclamationTriangle />
      </div>
      <h3 className="feedback-title">{title}</h3>
      <p className="feedback-message">{message}</p>
      {onRetry && (
        <div className="feedback-actions">
          <Button variant="secondary" icon={<FaRedo />} onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Success banner message.
 */
export function SuccessMessage({
  title = 'Success',
  message,
  onDismiss = null,
  className = '',
}) {
  return (
    <div className={`success-banner ${className}`} role="status">
      <FaCheckCircle className="success-icon" aria-hidden="true" />
      <div className="success-content">
        {title && <strong className="success-title">{title}</strong>}
        <p className="success-text">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="success-dismiss-btn"
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
}
