import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
  async checkUserType(email) {
    try {
      const response = await api.post('/auth/check-user-type', { email });
      return response.data;
    } catch (error) {
      console.error('Error checking user type:', error);
      throw error;
    }
  },

  async login(email, password) {
    try {
      // First check user type
      const userTypeResponse = await this.checkUserType(email);
      
      // Then perform login with the determined user type
      const response = await api.post('/auth/login', {
        email,
        password,
        userType: userTypeResponse.userType
      });

      const { token, user, vendor, userType: responseUserType } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (vendor) {
        localStorage.setItem('vendor', JSON.stringify(vendor));
      }
      localStorage.setItem('userType', responseUserType);
      localStorage.setItem('canEdit', userTypeResponse.canEdit);
      localStorage.setItem('canDelete', userTypeResponse.canDelete);

      return { token, user, vendor, userType: responseUserType, permissions: {
        canEdit: userTypeResponse.canEdit,
        canDelete: userTypeResponse.canDelete
      }};
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async googleLogin(token, userType = 'office') {
    try {
      const response = await api.post('/auth/google-login', { token, userType });
      const { token: authToken, user, vendor, userType: responseUserType } = response.data;
      
      if (authToken) {
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userType', responseUserType);
        if (vendor) {
          localStorage.setItem('vendor', JSON.stringify(vendor));
        }
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
    localStorage.removeItem('vendor');
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

// Vendor API
export const vendorAPI = {
  getAllVendors: async () => {
    const response = await api.get('/vendors');
    return response.data;
  },

  getAllConsumerVendors: async () => {
    const response = await api.get('/vendors/consumer');
    return response.data;
  },

  getVendorById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  createConsumerVendor: async (data) => {
    const response = await api.post('/vendors/consumer', data);
    return response.data;
  },

  updateVendor: async (id, vendorData) => {
    const response = await api.put(`/vendors/consumer/${id}`, vendorData);
    return response.data;
  },

  deleteVendor: async (id) => {
    const response = await api.delete(`/vendors/consumer/${id}`);
    return response.data;
  },

  updateVendorStatus: async (id, status) => {
    const response = await api.patch(`/vendors/${id}/status`, { status });
    return response.data;
  },

  vendorGoogleLogin: async (token) => {
    const response = await api.post('/auth/vendor/google-login', { token });
    if (response.data.token) {
      localStorage.setItem('vendorToken', response.data.token);
      localStorage.setItem('vendor', JSON.stringify(response.data.vendor));
    }
    return response.data;
  },

  getCurrentVendor: () => {
    const vendor = localStorage.getItem('vendor');
    return vendor ? JSON.parse(vendor) : null;
  },

  isVendorAuthenticated: () => {
    return !!localStorage.getItem('vendorToken');
  },

  vendorLogout: () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendor');
  },
};

// Company Vendor API
// Update the company vendor API methods
export const companyVendorAPI = {
  createCompanyVendor: async (vendorData) => {
    const response = await api.post('/vendors/company', vendorData);
    return response.data;
  },

  getAllCompanyVendors: async () => {
    const response = await api.get('/vendors/company');
    return response.data;
  },

  updateCompanyVendor: async (vendorId, vendorData) => {
    const response = await api.put(`/vendors/company/${vendorId}`, vendorData);
    return response.data;
  },

  deleteCompanyVendor: async (vendorId) => {
    const response = await api.delete(`/vendors/company/${vendorId}`);
    return response.data;
  }
};

// Role API
export const roleAPI = {
  createRole: async (roleData) => {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  getAllRoles: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  updateRole: async (roleId, roleData) => {
    const response = await api.put(`/roles/${roleId}`, roleData);
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await api.delete(`/roles/${roleId}`);
    return response.data;
  },

  getAllPermissions: async () => {
    const response = await api.get('/roles/permissions');
    return response.data;
  },

  assignRole: async (userId, roleId) => {
    const response = await api.post('/roles/assign-role', { 
      user_id: userId, 
      role_id: roleId 
    });
    return response.data;
  }
};

export default api;
