import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const fetchUserProfile = async (userType) => {
  try {
    const response = await axios.get(
      `${API_URL}/profile/${userType}`,
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

export const updateUserProfile = async (userType, profileData) => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/${userType}`,
      profileData,
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const updateProfileImage = async (userType, formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/profile/${userType}/image`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile image');
  }
};

export const updatePassword = async (userType, passwordData) => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/${userType}/password`,
      passwordData,
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};

export const updateNotificationSettings = async (userType, settings) => {
  try {
    const response = await axios.put(
      `${API_URL}/profile/${userType}/notifications`,
      settings,
      getHeaders()
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update notification settings');
  }
}; 