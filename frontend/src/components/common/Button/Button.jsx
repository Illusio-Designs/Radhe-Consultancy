import React from 'react';
import '../../../styles/components/common/Button.css';
import { FaSpinner } from 'react-icons/fa';

const Button = ({
  children,
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
}) => {
  const buttonClasses = [
    'custom-button',
    `button-${size}`,
    fullWidth ? 'button-full-width' : '',
    loading ? 'button-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <span className="button-spinner">
          <FaSpinner />
        </span>
      )}
      {icon && !loading && <span className="button-icon">{icon}</span>}
      <span className="button-content">{children}</span>
    </button>
  );
};

export default Button;
