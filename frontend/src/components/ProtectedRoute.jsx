import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // TODO: Replace with actual authentication check
  const isAuthenticated = false; // This should come from your auth context/state

  if (!isAuthenticated) {
    // Redirect to login page if user is not authenticated
    return <Navigate to="/auth/login" replace />;
  }

  // Render the protected content if user is authenticated
  return children;
}

export default ProtectedRoute;