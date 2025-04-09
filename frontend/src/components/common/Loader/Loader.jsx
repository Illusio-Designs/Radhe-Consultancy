import React from 'react';
import '../../../styles/components/common/Loader.css';

const Loader = ({ size = 'medium', color = 'primary' }) => {
  const sizeClasses = {
    small: 'loader-small',
    medium: 'loader-medium',
    large: 'loader-large'
  };

  const colorClasses = {
    primary: 'loader-primary',
    secondary: 'loader-secondary',
    white: 'loader-white'
  };

  return (
    <div className="loader-container">
      <div className={`loader ${sizeClasses[size]} ${colorClasses[color]}`}>
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
};

export default Loader;