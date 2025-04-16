import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('API Service: Initializing with base URL:', API_URL);

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
      console.log('API Service: Adding token to request:', config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('API Service: No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Service: Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Service: Successful response from:', response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error cases
      if (error.response.status === 401) {
        console.log('API Service: Unauthorized error (401) for:', error.config.url);
        // Clear auth data on unauthorized but don't redirect automatically
        // This prevents redirect loops
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect automatically - let the component handle it
        // window.location.href = '/auth/login';
      } else {
        console.error('API Service: Error response:', error.response.status, error.config.url);
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error('API Service: Network Error:', error.request);
      return Promise.reject({ error: 'Network error. Please check your connection.' });
    } else {
      console.error('API Service: Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

export const authAPI = {
  async login(email, password) {
    try {
      console.log('API Service: Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token && user) {
        console.log('API Service: Login successful, storing token and user data');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        console.error('API Service: Invalid login response - missing token or user');
      }
      
      return { token, user };
    } catch (error) {
      console.error('API Service: Login error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      console.log('API Service: Fetching current user data');
      const response = await api.get('/auth/me');
      const userData = response.data;
      console.log('API Service: Current user data fetched successfully');
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('API Service: Error fetching user data:', error);
      throw error;
    }
  },

  async register(username, email, password, role_id) {
    try {
      console.log('API Service: Attempting registration for:', email);
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        role_id
      });
      const { token, user } = response.data;
      
      if (token && user) {
        console.log('API Service: Registration successful, storing token and user data');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        console.error('API Service: Invalid registration response - missing token or user');
      }
      
      return { token, user };
    } catch (error) {
      console.error('API Service: Registration error:', error);
      throw error;
    }
  },

  logout() {
    console.log('API Service: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    console.log('API Service: Checking authentication status:', !!token);
    return !!token;
  }
};

// User API
export const userAPI = {
  getAllUsers: async () => {
    try {
      console.log('API Service: Fetching all users');
      const response = await api.get('/users');
      console.log('API Service: Users fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      console.log('API Service: Fetching user by ID:', id);
      const response = await api.get(`/users/${id}`);
      console.log('API Service: User fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching user:', error);
      throw error;
    }
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
  async getRoles() {
    try {
      console.log('API Service: Fetching all roles');
      const response = await api.get('/roles');
      console.log('API Service: Roles fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching roles:', error);
      throw error;
    }
  },

  async getRolePermissions(roleId) {
    try {
      const response = await api.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
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
