import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 30000
});

// Auth state management
let isAuthenticating = false;
let authPromise = null;

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure only allowed headers are sent
    const allowedHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': config.headers.Authorization,
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    config.headers = allowedHeaders;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error:', error);
      return Promise.reject({
        message: 'Network connection error. Please check your internet connection.',
        originalError: error
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !isAuthenticating) {
      isAuthenticating = true;
      
      // Create a single auth promise if not exists
      if (!authPromise) {
        authPromise = new Promise((resolve) => {
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect to login if we're on a protected route
          const currentPath = window.location.pathname;
          const isProtectedRoute = currentPath.startsWith('/dashboard') || 
                                 currentPath.startsWith('/profile') ||
                                 currentPath.startsWith('/admin');
          
          if (isProtectedRoute && !currentPath.includes('/auth/login')) {
            window.location.replace('/login');
          }
          
          resolve();
        });
      }
      
      // Wait for auth promise to resolve
      await authPromise;
      
      // Reset auth state
      isAuthenticating = false;
      authPromise = null;
      
      return Promise.reject(error);
    }
    
    // Log the full error for debugging
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { token, user };
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('API Service: Error fetching user data:', error);
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

  async googleLogin(token, role_name = 'user') {
    try {
      console.log('API Service: Attempting Google login');
      const response = await api.post('/auth/google-login', { token, role_name });
      const { token: authToken, user } = response.data;
      
      if (authToken && user) {
        console.log('API Service: Google login successful, storing token and user data');
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        console.error('API Service: Invalid Google login response - missing token or user');
      }
      
      return { token: authToken, user };
    } catch (error) {
      console.error('API Service: Google login error:', error);
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
      console.log('API Service: Company statistics fetched successfully');
      return response.data;
    } catch (error) {
      console.error('API Service: Error fetching company statistics:', error);
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
        console.log(pair[0], pair[1]);
      }

      const response = await api.post('/employee-compensation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for large files
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024, // 10MB
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

export default api;