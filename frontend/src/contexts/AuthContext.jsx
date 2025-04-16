import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

console.log('AuthContext: Initializing context');

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('AuthContext: Setting up provider with initial state:', { user, loading, error });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Starting authentication initialization');
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          console.log('AuthContext: Found stored credentials, verifying...');
          try {
            // Verify token by fetching current user
            const currentUser = await authAPI.getCurrentUser();
            console.log('AuthContext: Token verified, setting user:', currentUser);
            setUser(currentUser);
          } catch (error) {
            console.error('AuthContext: Token verification failed:', error);
            // Clear invalid credentials
            authAPI.logout();
            setUser(null);
          }
        } else {
          console.log('AuthContext: No stored credentials found');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthContext: Initialization error:', error);
        setError(error.message);
      } finally {
        console.log('AuthContext: Initialization complete');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process for:', email);
      setError(null);
      const { user: userData } = await authAPI.login(email, password);
      console.log('AuthContext: Login successful, setting user:', userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (username, email, password, role_id) => {
    try {
      console.log('AuthContext: Starting registration process for:', email);
      setError(null);
      const { user: userData } = await authAPI.register(username, email, password, role_id);
      console.log('AuthContext: Registration successful, setting user:', userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      setError(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    return user.role.toLowerCase() === requiredRole.toLowerCase();
  };

  const hasPermission = (requiredPermission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(requiredPermission);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
    hasPermission
  };

  console.log('AuthContext: Providing context value:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('AuthContext: useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
