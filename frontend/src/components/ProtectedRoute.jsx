import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './common/Loader/Loader'; // Import the Loader component
import React, { useState, useEffect } from 'react';

console.log('ProtectedRoute: Component loaded');

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the role from either role_name or role property
  const userRole = user?.role_name || user?.role;

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000); // Ensure loader displays for at least 2000ms

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  console.log('ProtectedRoute: Rendering with props:', {
    path: location.pathname,
    allowedRoles,
    isAuthenticated,
    loading,
    user: user
      ? {
          id: user.id || user.user_id,
          role: userRole,
        }
      : null,
  });

  if (loading || showLoader) {
    console.log('ProtectedRoute: Showing loader');
    return <Loader size="medium" />; // Use the Loader component here
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute: User role not authorized:', {
      userRole,
      allowedRoles,
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute: Access granted to:', location.pathname);
  return children;
};

export default ProtectedRoute;