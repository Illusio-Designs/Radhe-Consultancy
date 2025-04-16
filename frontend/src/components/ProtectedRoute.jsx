import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

console.log('ProtectedRoute: Component loaded');

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Rendering with props:', {
    path: location.pathname,
    allowedRoles,
    isAuthenticated,
    loading,
    user: user ? { id: user.id, role: user.role } : null
  });

  if (loading) {
    console.log('ProtectedRoute: Still loading, showing loading state');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute: User role not authorized:', {
      userRole: user.role,
      allowedRoles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute: Access granted to:', location.pathname);
  return children;
};

export default ProtectedRoute;