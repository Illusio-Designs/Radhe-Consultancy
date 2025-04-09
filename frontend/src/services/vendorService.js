import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const vendorService = {
  getAllVendors: async () => {
    try {
      const response = await axios.get(`${API_URL}/vendors`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getVendorById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createVendor: async (vendorData) => {
    try {
      const response = await axios.post(`${API_URL}/vendors`, vendorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateVendor: async (id, vendorData) => {
    try {
      const response = await axios.put(`${API_URL}/vendors/${id}`, vendorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteVendor: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/vendors/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateVendorStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_URL}/vendors/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default vendorService;