import React from 'react';
import '../../../styles/components/common/Loader.css';

const Loader = ({ size = 'medium' }) => {
  return (
    <div className="loader-container" style={{
      backgroundColor: 'white',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div className={`loader loader-${size} loader-primary`}>
        <div className="loader-spinner" />
      </div>
    </div>
  );
};

export default Loader;