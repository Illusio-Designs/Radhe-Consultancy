import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (idToken, userType = 'office') => {
    try {
      const data = await authAPI.googleLogin(idToken, userType);
      if (userType === 'vendor') {
        setUser(data.vendor);
      } else {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, email, password, role_id) => {
    try {
      const data = await authAPI.register(username, email, password, role_id);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    googleLogin,
    register,
    logout,
    isAuthenticated: authAPI.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};