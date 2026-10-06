import { FaCheckCircle } from 'react-icons/fa';
import './Badge.css';

/**
 * Status or category badge.
 * @param {object} props
 * @param {'success'|'warning'|'danger'|'info'|'primary'|'neutral'} [props.tone]
 * @param {boolean} [props.verified] Shows verified checkmark badge
 */
export default function Badge({
  children,
  tone = 'neutral',
  verified = false,
  size = 'md',
  className = '',
}) {
  if (verified) {
    return (
      <span className={`badge badge-verified badge-${size} ${className}`} title="Verified Local Professional">
        <FaCheckCircle className="badge-icon" aria-hidden="true" />
        <span>Verified</span>
      </span>
    );
  }

  return (
    <span className={`badge badge-${tone} badge-${size} ${className}`}>
      {children}
    </span>
  );
}
