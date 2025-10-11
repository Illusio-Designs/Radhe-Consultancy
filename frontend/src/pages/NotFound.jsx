import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader/Loader';
import '../styles/pages/dashboard/auth/Auth.css';

const NotFound = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="auth-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '72px', marginBottom: '20px', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#555' }}>Page Not Found</h2>
      <p style={{ fontSize: '18px', marginBottom: '30px', color: '#777' }}>
        Sorry, the page you're looking for doesn't exist.
      </p>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '12px 30px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go Back Home
      </button>
    </div>
  );
};

export default NotFound; 
