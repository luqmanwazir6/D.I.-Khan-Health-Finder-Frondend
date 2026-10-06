import { forwardRef } from 'react';
import './FormControls.css';

const Select = forwardRef(function Select(
  {
    label,
    id,
    name,
    options = [],
    error,
    helperText,
    required = false,
    placeholder = 'Select an option',
    className = '',
    ...rest
  },
  ref,
) {
  const selectId = id || name;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="select-wrapper">
        <select
          ref={ref}
          id={selectId}
          name={name}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-help` : undefined}
          className="form-select"
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      </div>
      {error && (
        <p id={`${selectId}-error`} className="form-error" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${selectId}-help`} className="form-helper">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Select;
