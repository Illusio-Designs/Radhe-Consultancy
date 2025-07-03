import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Auth state management
let isAuthenticating = false;
let authPromise = null;

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      return Promise.reject({
        message: 'Network connection error. Please check your internet connection.',
        isNetworkError: true
      });
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please check your internet connection and try again.',
        isNetworkError: true
      });
    }

    if (!error.response) {
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection.',
        isNetworkError: true
      });
    }

    // Handle specific error status codes
    switch (error.response.status) {
      case 401:
        // Clear token and redirect to login if unauthorized
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject({
          message: 'Session expired. Please login again.',
          status: 401
        });
      case 403:
        return Promise.reject({
          message: 'You do not have permission to perform this action.',
          status: 403
        });
      case 404:
        return Promise.reject({
          message: 'The requested resource was not found.',
          status: 404
        });
      case 500:
        return Promise.reject({
          message: 'Server error. Please try again later.',
          status: 500
        });
      default:
        return Promise.reject({
          message: error.response.data?.message || 'An unexpected error occurred.',
          status: error.response.status
        });
    }
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  googleLogin: async (credential) => {
    try {
      const response = await api.post('/auth/google', { token: credential });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  // Add WhatsApp OTP functions
  sendWhatsAppOTP: async (phone) => {
    try {
      const response = await api.post('/auth/whatsapp/send-otp', { phone });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyWhatsAppOTP: async (phone, otp) => {
    try {
      const response = await api.post('/auth/whatsapp/verify-otp', { phone, otp });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async register(username, email, password, role_name = 'user') {
    try {
      console.log('API Service: Attempting registration for:', email);
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        role_name
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

  async forgotPassword(email) {
    try {
      console.log('API Service: Sending forgot password request for:', email);
      const response = await api.post('/auth/forgot-password', { email });
      console.log('API Service: Forgot password request successful');
      return response.data;
    } catch (error) {
      console.error('API Service: Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(token, password) {
    try {
      console.log('API Service: Sending reset password request');
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      console.log('API Service: Reset password request successful');
      return response.data;
    } catch (error) {
      console.error('API Service: Reset password error:', error);
      throw error;
    }
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
      
      // First try to get the current user's ID from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const userId = id || currentUser?.id;
      
      if (!userId) {
        throw new Error('No user ID provided and no current user found');
      }

      const response = await api.get(`/users/${userId}`);
      console.log('API Service: User fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching user:', error);
      if (error.response?.status === 404) {
        throw new Error('User not found');
      }
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

  getCurrentUser: async () => {
    try {
      console.log('API Service: Fetching current user');
      const response = await api.get('/auth/me');
      console.log('API Service: Current user fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching current user:', error);
      throw error;
    }
  },

  updateUser: async (userId, data) => {
    try {
      console.log('API Service: Updating user:', userId);
      
      // Check if data is FormData (file upload)
      const isFormData = data instanceof FormData;
      console.log('Is FormData:', isFormData);
      
      // Configure headers based on data type
      const config = {
        headers: {
          'Content-Type': isFormData ? undefined : 'application/json'
        }
      };

      console.log('Sending update request with config:', config);
      const response = await api.put(`/users/${userId}`, data, config);
      console.log('API Service: User updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating user:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
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
    try {
      console.log('API Service: Changing password');
      const response = await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      console.log('API Service: Password changed successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error changing password:', error);
      throw error;
    }
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
    try {
      console.log('API Service: Updating profile image for user:', userId);
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post(`/users/${userId}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('API Service: Profile image updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating profile image:', error);
      throw error;
    }
  },

  getUserPermissions: async (userId) => {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data;
  },
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
  },

  assignRole: async (user_id, role_id) => {
    try {
      const response = await api.post('/roles/assign', { user_id, role_id });
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }
};

// Company API
export const companyAPI = {
  getAllCompanies: async () => {
    try {
      const response = await api.get('/companies');
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  },

  getCompanyById: async (id) => {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  },

  createCompany: async (formData) => {
    try {
      console.log('[API] Creating company:', {
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : typeof value,
          value: value instanceof File ? {
            name: value.name,
            type: value.type,
            size: value.size,
            lastModified: value.lastModified
          } : value
        }))
      });

      const response = await api.post('/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024 // 10MB
      });

      console.log('[API] Company creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error creating company:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  updateCompany: async (id, formData) => {
    try {
      console.log('[API] Updating company:', { id, formDataEntries: Array.from(formData.entries()) });

      // Log file details before sending
      const gstFile = formData.get('gst_document');
      const panFile = formData.get('pan_document');

      if (gstFile instanceof File) {
        console.log('[API] GST document details:', {
          name: gstFile.name,
          type: gstFile.type,
          size: gstFile.size
        });
      }

      if (panFile instanceof File) {
        console.log('[API] PAN document details:', {
          name: panFile.name,
          type: panFile.type,
          size: panFile.size
        });
      }

      const response = await api.put(`/companies/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024 // 10MB
      });

      console.log('[API] Company update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error updating company:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCompany: async (id) => {
    try {
      const response = await api.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  },

  // Add searchCompanies method
  searchCompanies: async (params) => {
    try {
      const response = await api.get('/companies/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching companies:', error);
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
      
      // Check if response has data property
      if (response && response.data) {
        // If response.data is an array, return it directly
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // If response.data has a data property that's an array, return that
        else if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // If response.data has a success property and a data property that's an array
        else if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // If none of the above, log the invalid format and return empty array
        else {
          console.error('API Service: Invalid response format:', response);
          return [];
        }
      } else {
        console.error('API Service: Invalid response format:', response);
        return [];
      }
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

  updateConsumer: async (id, formData) => {
    try {
      console.log('[API] Updating consumer:', { id });

      // Log FormData contents for debugging
      if (formData instanceof FormData) {
        console.log('[API] FormData contents:');
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, {
              name: value.name,
              type: value.type,
              size: value.size
            });
          } else {
            console.log(`${key}:`, value);
          }
        }
      }

      const response = await api.put(`/consumers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024 // 10MB
      });

      console.log('[API] Consumer update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error updating consumer:', error.response?.data || error.message);
      throw error;
    }
  },

  createConsumer: async (formData) => {
    try {
      console.log('[API] Creating consumer');

      // Log FormData contents for debugging
      if (formData instanceof FormData) {
        console.log('[API] FormData contents:');
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, {
              name: value.name,
              type: value.type,
              size: value.size
            });
          } else {
            console.log(`${key}:`, value);
          }
        }
      }

      const response = await api.post('/consumers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024 // 10MB
      });

      console.log('[API] Consumer creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error creating consumer:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

// Admin API
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

// Admin Dashboard API
export const adminDashboardAPI = {
  getCompanyStatistics: async () => {
    try {
      console.log('API Service: Fetching company statistics');
      const response = await api.get('/admin-dashboard/statistics');
      console.log('API Service: Raw response:', response);
      console.log('API Service: Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching company statistics:', error);
      if (error.response) {
        console.error('API Service: Error response:', error.response.data);
        console.error('API Service: Error status:', error.response.status);
      }
      throw error;
    }
  }
};

// Employee Compensation API
export const employeeCompensationAPI = {
  getAllPolicies: async () => {
    try {
      console.log('API Service: Fetching all employee compensation policies');
      const response = await api.get('/employee-compensation');
      console.log('API Service: Policies fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching policies:', error);
      throw error;
    }
  },

  getActiveCompanies: async () => {
    try {
      console.log('API Service: Fetching active companies');
      const response = await api.get('/employee-compensation/companies');
      console.log('API Service: Active companies fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching active companies:', error);
      throw error;
    }
  },

  searchPolicies: async (searchParams) => {
    try {
      console.log('API Service: Searching employee compensation policies');
      const response = await api.get('/employee-compensation/search', { params: searchParams });
      console.log('API Service: Search completed successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error searching policies:', error);
      throw error;
    }
  },

  getPolicy: async (id) => {
    try {
      console.log('API Service: Fetching employee compensation policy:', id);
      const response = await api.get(`/employee-compensation/${id}`);
      console.log('API Service: Policy fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching policy:', error);
      throw error;
    }
  },

  createPolicy: async (formData) => {
    try {
      console.log('[API] Creating employee compensation policy');
      console.log('[API] FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], {
            name: pair[1].name,
            type: pair[1].type,
            size: pair[1].size,
            lastModified: new Date(pair[1].lastModified).toISOString()
          });
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      const response = await api.post('/employee-compensation', formData, {
        headers: {
          'Content-Type': undefined, // Let the browser set the correct Content-Type with boundary
        },
        timeout: 30000, // 30 second timeout for large files
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024, // 10MB
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error creating employee compensation policy:', error);
      if (error.response) {
        console.error('[API] Error response:', error.response.data);
      }
      throw error;
    }
  },

  updatePolicy: async (id, formData) => {
    try {
      console.log('[API] Updating employee compensation policy:', id);
      console.log('[API] FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], {
            name: pair[1].name,
            type: pair[1].type,
            size: pair[1].size,
            lastModified: new Date(pair[1].lastModified).toISOString()
          });
        } else {
          console.log(pair[0], pair[1]);
        }
      }

      const response = await api.put(`/employee-compensation/${id}`, formData, {
        headers: {
          'Content-Type': undefined, // Let the browser set the correct Content-Type with boundary
        },
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,
        transformRequest: [(data) => data], // Prevent axios from transforming FormData
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error updating employee compensation policy:', error);
      if (error.response) {
        console.error('[API] Error response:', error.response.data);
      }
      throw error;
    }
  },

  deletePolicy: async (id) => {
    try {
      console.log('API Service: Deleting employee compensation policy:', id);
      const response = await api.delete(`/employee-compensation/${id}`);
      console.log('API Service: Policy deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting policy:', error);
      throw error;
    }
  }
};

// Insurance Company API
export const insuranceCompanyAPI = {
  getAllCompanies: async () => {
    try {
      const response = await api.get('/insurance-companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      const response = await api.post('/insurance-companies', companyData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCompany: async (id) => {
    try {
      console.log('API Service: Fetching insurance company:', id);
      const response = await api.get(`/insurance-companies/${id}`);
      console.log('API Service: Insurance company fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching insurance company:', error);
      throw error;
    }
  },

  updateCompany: async (id, companyData) => {
    try {
      console.log('API Service: Updating insurance company:', id);
      const response = await api.put(`/insurance-companies/${id}`, companyData);
      console.log('API Service: Insurance company updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating insurance company:', error);
      throw error;
    }
  },

  deleteCompany: async (id) => {
    try {
      console.log('API Service: Deleting insurance company:', id);
      const response = await api.delete(`/insurance-companies/${id}`);
      console.log('API Service: Insurance company deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting insurance company:', error);
      throw error;
    }
  }
};

// Vehicle Policy API
export const vehiclePolicyAPI = {
  getAllPolicies: async () => {
    try {
      const response = await api.get('/vehicle-policies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveCompanies: async () => {
    try {
      const response = await api.get('/vehicle-policies/companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveConsumers: async () => {
    try {
      const response = await api.get('/vehicle-policies/consumers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchPolicies: async (searchParams) => {
    try {
      const response = await api.get('/vehicle-policies/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPolicy: async (id) => {
    try {
      const response = await api.get(`/vehicle-policies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createPolicy: async (policyData) => {
    try {
      // Ensure we're sending the file with the correct field name
      if (policyData instanceof FormData) {
        // Log the FormData contents for debugging
        for (let [key, value] of policyData.entries()) {
          if (value instanceof File) {
            console.log('[API] File in FormData:', {
              field: key,
              name: value.name,
              type: value.type,
              size: value.size
            });
          }
        }
      }

      const response = await api.post('/vehicle-policies', policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Add timeout and maxContentLength for large files
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024, // 10MB
        // Ensure proper handling of FormData
        transformRequest: [(data) => data]
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error creating policy:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.response?.config
      });
      throw error;
    }
  },
  updatePolicy: async (id, policyData) => {
    try {
      const response = await api.put(`/vehicle-policies/${id}`, policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deletePolicy: async (id) => {
    try {
      const response = await api.delete(`/vehicle-policies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Health Policy API
export const healthPolicyAPI = {
  getAllPolicies: async () => {
    try {
      const response = await api.get('/health-policies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveCompanies: async () => {
    try {
      const response = await api.get('/health-policies/companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveConsumers: async () => {
    try {
      const response = await api.get('/health-policies/consumers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveInsuranceCompanies: async () => {
    try {
      const response = await api.get('/health-policies/insurance-companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchPolicies: async (searchParams) => {
    try {
      const response = await api.get('/health-policies/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPolicy: async (id) => {
    try {
      const response = await api.get(`/health-policies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createPolicy: async (policyData) => {
    try {
      if (policyData instanceof FormData) {
        for (let [key, value] of policyData.entries()) {
          if (value instanceof File) {
            console.log('[API] File in FormData:', {
              field: key,
              name: value.name,
              type: value.type,
              size: value.size
            });
          }
        }
      }
      const response = await api.post('/health-policies', policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,
        transformRequest: [(data) => data]
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error creating health policy:', error);
      throw error;
    }
  },
  updatePolicy: async (id, policyData) => {
    try {
      const response = await api.put(`/health-policies/${id}`, policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deletePolicy: async (id) => {
    try {
      const response = await api.delete(`/health-policies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Fire Policy API
export const firePolicyAPI = {
  getAllPolicies: async () => {
    try {
      const response = await api.get('/fire-policies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveCompanies: async () => {
    try {
      const response = await api.get('/fire-policies/companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveConsumers: async () => {
    try {
      const response = await api.get('/fire-policies/consumers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getActiveInsuranceCompanies: async () => {
    try {
      const response = await api.get('/fire-policies/insurance-companies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  searchPolicies: async (searchParams) => {
    try {
      const response = await api.get('/fire-policies/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPolicy: async (id) => {
    try {
      const response = await api.get(`/fire-policies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createPolicy: async (policyData) => {
    try {
      if (policyData instanceof FormData) {
        for (let [key, value] of policyData.entries()) {
          if (value instanceof File) {
            console.log('[API] File in FormData:', {
              field: key,
              name: value.name,
              type: value.type,
              size: value.size
            });
          }
        }
      }
      const response = await api.post('/fire-policies', policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,
        transformRequest: [(data) => data]
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error creating fire policy:', error);
      throw error;
    }
  },
  updatePolicy: async (id, policyData) => {
    try {
      const response = await api.put(`/fire-policies/${id}`, policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deletePolicy: async (id) => {
    try {
      const response = await api.delete(`/fire-policies/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Life Policy API
export const lifePolicyAPI = {
  getAllPolicies: async () => {
    try {
      console.log('API Service: Fetching all life policies');
      const response = await api.get('/life-policies');
      console.log('API Service: Life policies fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching life policies:', error);
      throw error;
    }
  },

  getActiveCompanies: async () => {
    try {
      console.log('API Service: Fetching active companies for life policies');
      const response = await api.get('/life-policies/companies');
      console.log('API Service: Active companies fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching active companies:', error);
      throw error;
    }
  },

  getActiveConsumers: async () => {
    try {
      console.log('API Service: Fetching active consumers for life policies');
      const response = await api.get('/life-policies/consumers');
      console.log('API Service: Active consumers fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching active consumers:', error);
      throw error;
    }
  },

  searchPolicies: async (searchParams) => {
    try {
      console.log('API Service: Searching life policies');
      const response = await api.get('/life-policies/search', { params: searchParams });
      console.log('API Service: Search completed successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error searching life policies:', error);
      throw error;
    }
  },

  getPolicy: async (id) => {
    try {
      console.log('API Service: Fetching life policy:', id);
      const response = await api.get(`/life-policies/${id}`);
      console.log('API Service: Life policy fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching life policy:', error);
      throw error;
    }
  },

  createPolicy: async (policyData) => {
    try {
      console.log('[API] Creating life policy');
      
      // Log FormData contents for debugging
      if (policyData instanceof FormData) {
        console.log('[API] FormData contents:');
        for (let [key, value] of policyData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, {
              name: value.name,
              type: value.type,
              size: value.size
            });
          } else {
            console.log(`${key}:`, value);
          }
        }
      }

      const response = await api.post('/life-policies', policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000, // 30 second timeout for large files
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024, // 10MB
        transformRequest: [(data) => data] // Prevent axios from transforming FormData
      });

      console.log('[API] Life policy creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error creating life policy:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePolicy: async (id, policyData) => {
    try {
      console.log('[API] Updating life policy:', id);
      
      // Log FormData contents for debugging
      if (policyData instanceof FormData) {
        console.log('[API] FormData contents:');
        for (let [key, value] of policyData.entries()) {
          if (value instanceof File) {
            console.log(`${key}:`, {
              name: value.name,
              type: value.type,
              size: value.size
            });
          } else {
            console.log(`${key}:`, value);
          }
        }
      }

      const response = await api.put(`/life-policies/${id}`, policyData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,
        transformRequest: [(data) => data]
      });

      console.log('[API] Life policy update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error updating life policy:', error.response?.data || error.message);
      throw error;
    }
  },

  deletePolicy: async (id) => {
    try {
      console.log('API Service: Deleting life policy:', id);
      const response = await api.delete(`/life-policies/${id}`);
      console.log('API Service: Life policy deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting life policy:', error);
      throw error;
    }
  }
};

// DSC API
export const dscAPI = {
  getAllDSCs: async () => {
    try {
      console.log('API Service: Fetching all DSCs');
      const response = await api.get('/dsc');
      console.log('API Service: DSCs fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching DSCs:', error);
      throw error;
    }
  },

  getDSCById: async (id) => {
    try {
      console.log('API Service: Fetching DSC by ID:', id);
      const response = await api.get(`/dsc/${id}`);
      console.log('API Service: DSC fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching DSC:', error);
      throw error;
    }
  },

  createDSC: async (dscData) => {
    try {
      console.log('API Service: Creating DSC');
      const response = await api.post('/dsc', dscData);
      console.log('API Service: DSC created successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error creating DSC:', error);
      throw error;
    }
  },

  updateDSC: async (id, dscData) => {
    try {
      console.log('API Service: Updating DSC:', id);
      const response = await api.put(`/dsc/${id}`, dscData);
      console.log('API Service: DSC updated successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error updating DSC:', error);
      throw error;
    }
  },

  changeDSCStatus: async (id, status) => {
    try {
      console.log('API Service: Changing DSC status:', id, status);
      const response = await api.patch(`/dsc/${id}/status`, { status });
      console.log('API Service: DSC status changed successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error changing DSC status:', error);
      throw error;
    }
  },

  deleteDSC: async (id) => {
    try {
      console.log('API Service: Deleting DSC:', id);
      const response = await api.delete(`/dsc/${id}`);
      console.log('API Service: DSC deleted successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error deleting DSC:', error);
      throw error;
    }
  },

  getActiveCompanies: async () => {
    try {
      console.log('API Service: Fetching active companies');
      const response = await api.get('/dsc/companies');
      console.log('API Service: Active companies fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching active companies:', error);
      return [];
    }
  },

  getActiveConsumers: async () => {
    try {
      console.log('API Service: Fetching active consumers');
      const response = await api.get('/dsc/consumers');
      console.log('API Service: Active consumers fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching active consumers:', error);
      return [];
    }
  },

  getDSCsByCompany: async (companyId) => {
    try {
      console.log('API Service: Fetching DSCs by company:', companyId);
      const response = await api.get(`/dsc/company/${companyId}`);
      console.log('API Service: Company DSCs fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching company DSCs:', error);
      throw error;
    }
  },

  getDSCsByConsumer: async (consumerId) => {
    try {
      console.log('API Service: Fetching DSCs by consumer:', consumerId);
      const response = await api.get(`/dsc/consumer/${consumerId}`);
      console.log('API Service: Consumer DSCs fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching consumer DSCs:', error);
      throw error;
    }
  }
};

// Renewal API
export const renewalAPI = {
  getCounts: async () => {
    try {
      const response = await api.get('/renewals/counts');
      return response.data;
    } catch (error) {
      console.error('Error fetching renewal counts:', error);
      throw error;
    }
  },
  getList: async (type) => {
    try {
      const response = await api.get(`/renewals/list/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching renewal list:', error);
      throw error;
    }
  },
  getRenewals: async (period) => {
    try {
      const response = await api.get(`/renewals/${period}`); // period: week, month, year
      return response.data;
    } catch (error) {
      console.error('Error fetching renewals:', error);
      throw error;
    }
  },
  sendReminder: async (payload) => {
    try {
      const response = await api.post('/renewals/remind', payload);
      return response.data;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  },
  getLog: async () => {
    try {
      const response = await api.get('/renewals/log');
      return response.data;
    } catch (error) {
      console.error('Error fetching renewal log:', error);
      throw error;
    }
  },
  getListByTypeAndPeriod: async (type, period) => {
    try {
      const response = await api.get(`/renewals/list/${type}/${period}`);
      console.log("API Service: getListByTypeAndPeriod raw response.data:", response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching renewal list by type and period:', error);
      throw error;
    }
  }
};

export default api;