import React from 'react';
import Loader from '../components/common/Loader/Loader';
import '../styles/pages/dashboard/auth/Auth.css';

const NotFound = () => {
  return (
    <div className="auth-container">
      <Loader />
    </div>
  );
};

export default NotFound; 