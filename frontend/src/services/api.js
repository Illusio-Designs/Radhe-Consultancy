import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  googleLogin: async (idToken, userType) => {
    const response = await api.post('/auth/google-login', { 
      token: idToken,
      userType: userType 
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (userType === 'vendor') {
        localStorage.setItem('vendor', JSON.stringify(response.data.vendor));
      } else {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
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

  getVendorById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  createVendor: async (vendorData) => {
    const response = await api.post('/vendors', vendorData);
    return response.data;
  },

  updateVendor: async (id, vendorData) => {
    const response = await api.put(`/vendors/${id}`, vendorData);
    return response.data;
  },

  deleteVendor: async (id) => {
    const response = await api.delete(`/vendors/${id}`);
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
  }
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
