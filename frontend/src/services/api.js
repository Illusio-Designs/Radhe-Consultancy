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
    try {
      console.log('API Service: Creating user');
      const response = await api.post('/users', userData);
      console.log('API Service: User created successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      console.log('API Service: Updating user:', id);
      const response = await api.put(`/users/${id}`, userData);
      console.log('API Service: User updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      console.log('API Service: Deleting user:', id);
      const response = await api.delete(`/users/${id}`);
      console.log('API Service: User deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting user:', error);
      throw error;
    }
  },

  getCompanyUsers: async () => {
    try {
      console.log('API Service: Fetching company users');
      const response = await api.get('/users/company');
      console.log('API Service: Company users fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching company users:', error);
      throw error;
    }
  },

  getConsumerUsers: async () => {
    try {
      console.log('API Service: Fetching consumer users');
      const response = await api.get('/users/consumer');
      console.log('API Service: Consumer users fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching consumer users:', error);
      throw error;
    }
  },

  getOtherUsers: async () => {
    try {
      console.log('API Service: Fetching other users');
      const response = await api.get('/users/other');
      console.log('API Service: Other users fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching other users:', error);
      throw error;
    }
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

  getRoleById: async (id) => {
    try {
      console.log('API Service: Fetching role by ID:', id);
      const response = await api.get(`/roles/${id}`);
      console.log('API Service: Role fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching role:', error);
      throw error;
    }
  },

  createRole: async (roleData) => {
    try {
      console.log('API Service: Creating role');
      const response = await api.post('/roles', roleData);
      console.log('API Service: Role created successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error creating role:', error);
      throw error;
    }
  },

  updateRole: async (id, roleData) => {
    try {
      console.log('API Service: Updating role:', id);
      const response = await api.put(`/roles/${id}`, roleData);
      console.log('API Service: Role updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating role:', error);
      throw error;
    }
  },

  deleteRole: async (id) => {
    try {
      console.log('API Service: Deleting role:', id);
      const response = await api.delete(`/roles/${id}`);
      console.log('API Service: Role deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting role:', error);
      throw error;
    }
  },

  getRolePermissions: async (roleId) => {
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
    try {
      console.log('API Service: Fetching all companies');
      const response = await api.get('/companies');
      console.log('API Service: Companies fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching companies:', error);
      throw error;
    }
  },

  getCompanyById: async (id) => {
    try {
      console.log('API Service: Fetching company by ID:', id);
      const response = await api.get(`/companies/${id}`);
      console.log('API Service: Company fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching company:', error);
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      console.log('API Service: Creating company');
      const response = await api.post('/companies', companyData);
      console.log('API Service: Company created successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error creating company:', error);
      throw error;
    }
  },

  updateCompany: async (id, companyData) => {
    try {
      console.log('API Service: Updating company:', id);
      const response = await api.put(`/companies/${id}`, companyData);
      console.log('API Service: Company updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating company:', error);
      throw error;
    }
  },

  deleteCompany: async (id) => {
    try {
      console.log('API Service: Deleting company:', id);
      const response = await api.delete(`/companies/${id}`);
      console.log('API Service: Company deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting company:', error);
      throw error;
    }
  }
};

// Consumer API
export const consumerAPI = {
  getAllConsumers: async () => {
    try {
      console.log('API Service: Fetching all consumers');
      const response = await api.get('/consumers');
      console.log('API Service: Consumers fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching consumers:', error);
      throw error;
    }
  },

  getConsumerById: async (id) => {
    try {
      console.log('API Service: Fetching consumer by ID:', id);
      const response = await api.get(`/consumers/${id}`);
      console.log('API Service: Consumer fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching consumer:', error);
      throw error;
    }
  },

  createConsumer: async (consumerData) => {
    try {
      console.log('API Service: Creating consumer');
      const response = await api.post('/consumers', consumerData);
      console.log('API Service: Consumer created successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error creating consumer:', error);
      throw error;
    }
  },

  updateConsumer: async (id, consumerData) => {
    try {
      console.log('API Service: Updating consumer:', id);
      const response = await api.put(`/consumers/${id}`, consumerData);
      console.log('API Service: Consumer updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating consumer:', error);
      throw error;
    }
  },

  deleteConsumer: async (id) => {
    try {
      console.log('API Service: Deleting consumer:', id);
      const response = await api.delete(`/consumers/${id}`);
      console.log('API Service: Consumer deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting consumer:', error);
      throw error;
    }
  }
};

export const vendorAPI = {
  async getVendors() {
    try {
      console.log('API Service: Fetching vendors');
      const response = await api.get('/vendors');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching vendors:', error);
      throw error;
    }
  },

  async getVendorById(vendorId) {
    try {
      console.log('API Service: Fetching vendor by ID:', vendorId);
      const response = await api.get(`/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching vendor:', error);
      throw error;
    }
  },

  async createVendor(vendorData) {
    try {
      console.log('API Service: Creating vendor');
      const response = await api.post('/vendors', vendorData);
      return response.data;
    } catch (error) {
      console.error('API Service: Error creating vendor:', error);
      throw error;
    }
  },

  async updateVendor(vendorId, vendorData) {
    try {
      console.log('API Service: Updating vendor:', vendorId);
      const response = await api.put(`/vendors/${vendorId}`, vendorData);
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating vendor:', error);
      throw error;
    }
  },

  async deleteVendor(vendorId) {
    try {
      console.log('API Service: Deleting vendor:', vendorId);
      const response = await api.delete(`/vendors/${vendorId}`);
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting vendor:', error);
      throw error;
    }
  },

  async createConsumerVendor(vendorData) {
    try {
      console.log('API Service: Creating consumer vendor');
      const response = await api.post('/vendors/consumer', vendorData);
      return response.data;
    } catch (error) {
      console.error('API Service: Error creating consumer vendor:', error);
      throw error;
    }
  },

  async getConsumerVendors() {
    try {
      console.log('API Service: Fetching consumer vendors');
      const response = await api.get('/vendors/consumer');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching consumer vendors:', error);
      throw error;
    }
  }
};

export const adminAPI = {
  async getAdminStats() {
    try {
      console.log('API Service: Fetching admin stats');
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching admin stats:', error);
      throw error;
    }
  },

  async getRecentActivities() {
    try {
      console.log('API Service: Fetching recent activities');
      const response = await api.get('/admin/activities');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching recent activities:', error);
      throw error;
    }
  },

  async getSystemHealth() {
    try {
      console.log('API Service: Fetching system health');
      const response = await api.get('/admin/health');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching system health:', error);
      throw error;
    }
  }
};

export default api;
