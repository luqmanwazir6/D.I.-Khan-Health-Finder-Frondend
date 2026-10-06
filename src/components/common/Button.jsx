import './Button.css';

/**
 * Reusable accessible button.
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'amber'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {boolean} [props.isLoading]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.iconRight]
 * @param {boolean} [props.fullWidth]
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : (
        icon && <span className="btn-icon-left" aria-hidden="true">{icon}</span>
      )}
      <span className="btn-text">{children}</span>
      {!isLoading && iconRight && (
        <span className="btn-icon-right" aria-hidden="true">{iconRight}</span>
      )}
    </button>
  );
}
