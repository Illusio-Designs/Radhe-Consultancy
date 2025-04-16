import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

console.log('ProtectedRoute: Component loaded');

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the role from either role_name or role property
  const userRole = user?.role_name || user?.role;

  console.log('ProtectedRoute: Rendering with props:', {
    path: location.pathname,
    allowedRoles,
    isAuthenticated,
    loading,
    user: user ? { 
      id: user.id || user.user_id, 
      role: userRole 
    } : null
  });

  if (loading) {
    console.log('ProtectedRoute: Still loading, showing loading state');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute: User role not authorized:', {
      userRole,
      allowedRoles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute: Access granted to:', location.pathname);
  return children;
};

export default ProtectedRoute;