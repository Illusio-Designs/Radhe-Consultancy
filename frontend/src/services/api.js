import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error('VITE_API_URL environment variable is not set');
}

console.log('API Service: Initializing with configuration:');
console.log('- Environment:', import.meta.env.MODE);
console.log('- API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('\n=== API Request Debug Log ===');
    console.log('Request Details:');
    console.log('- URL:', config.url);
    console.log('- Method:', config.method);
    console.log('- Base URL:', config.baseURL);
    console.log('- Headers:', JSON.stringify(config.headers, null, 2));
    console.log('- Environment:', import.meta.env.MODE);
    
    const token = localStorage.getItem('token');
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials
    });
    
    if (token) {
      console.log('Adding Authorization token to request');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    
    // Add CORS headers for preflight
    if (config.method === 'options') {
      config.headers['Access-Control-Request-Method'] = config.method;
      config.headers['Access-Control-Request-Headers'] = 'Content-Type, Authorization';
    }
    
    console.log('=== End API Request Debug Log ===\n');
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
    console.log('API Service: Successful response from:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('\n=== API Response Error Debug Log ===');
    console.error('Environment:', import.meta.env.MODE);
    
    if (error.response) {
      console.error('Response Error Details:');
      console.error('- URL:', error.config.url);
      console.error('- Status:', error.response.status);
      console.error('- Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('- Data:', error.response.data);
      
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
    } else if (error.request) {
      console.error('API Service: Network Error:', error.request);
      return Promise.reject({ error: 'Network error. Please check your connection.' });
    } else {
      console.error('API Service: Error:', error.message);
      return Promise.reject({ error: error.message });
    }
    console.log('=== End API Response Error Debug Log ===\n');
    return Promise.reject(error);
  }
);

// Auth API
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
      console.log('API Service: Fetching all companies');
      const response = await api.get('/companies');
      console.log('API Service: Companies fetched successfully');
      
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
      console.error('API Service: Error fetching companies:', error);
      throw error;
    }
  },

  getCompanyById: async (id) => {
    try {
      console.log('API Service: Fetching company by ID:', id);
      const response = await api.get(`/companies/${id}`);
      console.log('API Service: Company fetched successfully');
      
      // Check if response has data property
      if (response && response.data && response.data.success) {
        return response.data.data;
      } else {
        console.error('API Service: Invalid response format:', response);
        return null;
      }
    } catch (error) {
      console.error('API Service: Error fetching company:', error);
      throw error;
    }
  },

  createCompany: async (companyData) => {
    try {
      console.log('API Service: Creating company');
      
      // Create FormData for company creation
      const formData = new FormData();
      
      // Add all company fields
      const fields = {
        company_name: companyData.get('company_name'),
        owner_name: companyData.get('owner_name'),
        owner_address: companyData.get('owner_address'),
        designation: companyData.get('designation'),
        company_address: companyData.get('company_address'),
        contact_number: companyData.get('contact_number'),
        company_email: companyData.get('company_email'),
        gst_number: companyData.get('gst_number'),
        pan_number: companyData.get('pan_number'),
        firm_type: companyData.get('firm_type'),
        nature_of_work: companyData.get('nature_of_work'),
        factory_license_number: companyData.get('factory_license_number'),
        labour_license_number: companyData.get('labour_license_number'),
        type_of_company: companyData.get('type_of_company')
      };

      // Log the fields being sent
      console.log('API Service: Fields being sent:', fields);

      // Append all fields to FormData
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Add files if they exist
      if (companyData.get('gst_document')) {
        formData.append('gst_document', companyData.get('gst_document'));
      }
      if (companyData.get('pan_document')) {
        formData.append('pan_document', companyData.get('pan_document'));
      }
      
      console.log('API Service: Creating company with data:', fields);
      
      const companyResponse = await api.post('/companies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (!companyResponse.data || !companyResponse.data.success) {
        throw new Error('Failed to create company');
      }
      
      console.log('API Service: Company and user created successfully');
      return companyResponse.data.data;
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

export default api;
