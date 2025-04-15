import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
      return Promise.reject({ error: 'Network error. Please check your connection.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

export const authAPI = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async googleLogin(token) {
    try {
      const response = await api.post('/auth/google-login', { token });
      const { token: authToken, user } = response.data;
      
      if (authToken) {
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Google login error:', error.response?.data || error);
      throw error;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: async (username, email, password, role_id) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        role_id
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

// User API
export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/users/reset-password/${token}`, { password });
    return response.data;
  },

  updateProfileImage: async (userId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/users/${userId}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserPermissions: async (userId) => {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data;
  }
};

// Role API
export const roleAPI = {
  getAllRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  getRoleById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  createRole: async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  updateRole: async (id, roleData) => {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  }
};

// Company API
export const companyAPI = {
  getAllCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },

  getCompanyById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  updateCompany: async (id, companyData) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  }
};

// Consumer API
export const consumerAPI = {
  getAllConsumers: async () => {
    const response = await api.get('/consumers');
    return response.data;
  },

  getConsumerById: async (id) => {
    const response = await api.get(`/consumers/${id}`);
    return response.data;
  },

  createConsumer: async (consumerData) => {
    const response = await api.post('/consumers', consumerData);
    return response.data;
  },

  updateConsumer: async (id, consumerData) => {
    const response = await api.put(`/consumers/${id}`, consumerData);
    return response.data;
  },

  deleteConsumer: async (id) => {
    const response = await api.delete(`/consumers/${id}`);
    return response.data;
  }
};

export default api;
