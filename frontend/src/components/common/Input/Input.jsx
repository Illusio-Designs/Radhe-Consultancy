import { forwardRef } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import '../../../styles/components/common/Input.css';

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      className = '',
      required = false,
      helperText,
      startIcon,
      endIcon,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}

        <div className="input-container">
          {startIcon && <span className="input-icon start">{startIcon}</span>}

          <input
            ref={ref}
            type={type}
            className={`input-field ${startIcon ? 'has-start-icon' : ''} ${endIcon || error ? 'has-end-icon' : ''} ${error ? 'input-error' : ''}`}
            {...props}
          />

          {endIcon && <span className="input-icon end">{endIcon}</span>}
          {error && !endIcon && (
            <FaExclamationCircle className="input-icon end error-icon" />
          )}
        </div>

        {(error || helperText) && (
          <p className={`input-helper ${error ? 'error' : ''}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
