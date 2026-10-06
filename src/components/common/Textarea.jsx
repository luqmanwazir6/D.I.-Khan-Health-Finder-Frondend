import { forwardRef } from 'react';
import './FormControls.css';

const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    name,
    rows = 4,
    error,
    helperText,
    required = false,
    className = '',
    ...rest
  },
  ref,
) {
  const textareaId = id || name;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-help` : undefined}
        className="form-textarea"
        {...rest}
      />
      {error && (
        <p id={`${textareaId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${textareaId}-help`} className="form-helper">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Textarea;
