import './Loader.css';

/**
 * Accessible loading indicator.
 * @param {object} props
 * @param {string} [props.label] Text announced to screen readers.
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {boolean} [props.fullPage] Centre within a tall area (route-level loading).
 * @param {boolean} [props.showLabel] Also display the label visually.
 */
export default function Loader({ label = 'Loading…', size = 'md', fullPage = false, showLabel = false }) {
  return (
    <div className="loader" data-full-page={fullPage || undefined} role="status" aria-live="polite">
      <span className="loader-spinner" data-size={size} aria-hidden="true" />
      <span className={showLabel ? 'loader-label' : 'visually-hidden'}>{label}</span>
    </div>
  );
}
