import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

console.log('ProtectedRoute: Component loaded');

const ProtectedRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: Rendering with props:', {
    path: location.pathname,
    requiredRoles,
    requiredPermissions,
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

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    console.log('ProtectedRoute: User role not authorized:', {
      userRole: user.role,
      requiredRoles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission =>
      user.permissions?.includes(permission)
    );

    if (!hasRequiredPermissions) {
      console.log('ProtectedRoute: User missing required permissions:', {
        userPermissions: user.permissions,
        requiredPermissions
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('ProtectedRoute: Access granted to:', location.pathname);
  return children;
};

export default ProtectedRoute;