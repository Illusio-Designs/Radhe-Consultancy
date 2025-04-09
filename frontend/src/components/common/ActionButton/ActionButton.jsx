import { useState } from 'react';
import PropTypes from 'prop-types';
import '../../../styles/components/common/ActionButton.css';

const ActionButton = ({
  onClick,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const baseClasses = [
    'action-button',
    `action-button-${variant}`,
    `action-button-${size}`,
    fullWidth ? 'action-button-full-width' : '',
    loading ? 'action-button-loading' : '',
    disabled ? 'action-button-disabled' : '',
    isHovered ? 'action-button-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? (
        <div className="action-button-spinner" />
      ) : (
        children
      )}
    </button>
  );
};

ActionButton.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default ActionButton;