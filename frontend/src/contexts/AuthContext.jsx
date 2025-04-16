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
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data);
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

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCompany: user?.role === 'company',
    isConsumer: user?.role === 'consumer'
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
