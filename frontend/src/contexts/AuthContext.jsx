import React, { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';

console.log('AuthContext: Initializing context');

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('AuthContext: Setting up provider with initial state:', { user, loading, error });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('AuthContext: No token found, skipping auth check');
        setLoading(false);
        return;
      }

      console.log('AuthContext: Checking authentication with token');
      const response = await api.get('/auth/me');
      console.log('AuthContext: User data from /me endpoint:', response.data);
      
      // Extract user data from the response
      if (response.data && response.data.user) {
        setUser(response.data.user);
        console.log('AuthContext: User data set from /me endpoint');
      } else {
        console.error('AuthContext: Invalid response format from /me endpoint');
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('AuthContext: Auth check error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Starting login process for:', email);
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('AuthContext: Login response:', { token, user });

      localStorage.setItem('token', token);
      setUser(user);

      return user;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Get the role from either role_name or role property
  const userRole = user?.role_name || user?.role;
  console.log('AuthContext: Current user role:', userRole);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isCompany: userRole === 'company',
    isConsumer: userRole === 'consumer'
  };

  console.log('AuthContext: Providing context value:', value);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
