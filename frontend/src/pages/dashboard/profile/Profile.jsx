import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiLock, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import { authAPI, userAPI } from "../../../services/api";
import img from "../../../assets/img (1).png";
import "../../../styles/pages/dashboard/profile/Profile.css";
import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';

// Add custom styles for phone input
const phoneInputCustomStyles = {
  '.PhoneInput': {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    backgroundColor: '#fff',
  },
  '.PhoneInputCountry': {
    marginRight: '0.5rem',
  },
  '.PhoneInputInput': {
    flex: '1',
    border: 'none',
    outline: 'none',
    padding: '0.25rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
  },
  '.PhoneInputCountrySelect': {
    width: '90px',
  },
  '.PhoneInputCountryIcon': {
    width: '25px',
    height: '20px',
  }
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

  // Function to convert image URL to data URL
  const getImageAsDataUrl = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to data URL:', error);
      return null;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getCurrentUser();
      
      // Convert image URL to data URL if it exists
      let imageDataUrl = null;
      if (data.user.imageUrl) {
        const imageUrl = `${BASE_URL}/profile-images/${data.user.imageUrl.split('/').pop()}`;
        imageDataUrl = await getImageAsDataUrl(imageUrl);
      }

      // Set both name and username from the response
      const userData = {
        ...data.user,
        name: data.user.username,
        imageUrl: imageDataUrl
      };
      
      setProfile(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      setError('File size should be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      // Create FormData for the file upload
      const formData = new FormData();
      formData.append('profile_image', file);

      console.log('Uploading profile image...', {
        userId: profile.id,
        formData: formData.get('profile_image')
      });

      // Update user with the new profile image
      const updatedUser = await userAPI.updateUser(profile.id, formData);
      console.log('Profile image update response:', updatedUser);

      if (!updatedUser || !updatedUser.imageUrl) {
        throw new Error('No image URL received from server');
      }

      // Convert new image to data URL
      const imageUrl = `${BASE_URL}/profile-images/${updatedUser.imageUrl.split('/').pop()}`;
      const imageDataUrl = await getImageAsDataUrl(imageUrl);

      // Update local state with the new image data URL
      const updatedProfile = {
        ...profile,
        imageUrl: imageDataUrl
      };
      
      console.log('Updating profile state:', updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setSuccess("Profile image updated successfully");
    } catch (err) {
      console.error('Error updating profile image:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        setError(err.response.data.message || "Failed to update profile image");
      } else {
        setError(err.message || "Failed to update profile image");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    console.log('Profile update started');
    
    // Get the current values from the profile state
    const currentPhoneNumber = profile?.contact_number;
    const currentName = profile?.name;
    console.log('Current values from state:', {
      name: currentName,
      contact_number: currentPhoneNumber
    });

    const formData = new FormData(event.target);
    console.log('Form data before update:', {
      name: formData.get('name'),
      contact_number: formData.get('contact_number'),
      email: formData.get('email')
    });

    // Create profile data with the current values from state
    const profileData = {
      username: currentName, // Use username instead of name
      contact_number: currentPhoneNumber,
      email: formData.get('email')
    };

    console.log('Profile data to be sent:', profileData);

    try {
      setLoading(true);
      console.log('Sending update request to API...');
      const updatedUser = await userAPI.updateUser(profile.id, profileData);
      console.log('API response:', updatedUser);
      
      // Update profile state with both username and name
      const updatedProfile = {
        ...updatedUser,
        name: updatedUser.username // Set name from username
      };
      
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    console.log('Name changed:', value);
    setProfile(prev => ({
      ...prev,
      name: value
    }));
  };

  const handlePhoneChange = (value) => {
    console.log('Phone number changed:', value);
    setProfile(prev => ({
      ...prev,
      contact_number: value
    }));
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { currentPassword, newPassword, confirmPassword } = Object.fromEntries(formData.entries());

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await userAPI.changePassword(currentPassword, newPassword);
      setSuccess("Password updated successfully");
      event.target.reset();
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading && !profile) {
    return <Loader size="large" />;
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiLock /> }
  ];

  return (
    <div className="profile-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={profile?.imageUrl || img}
              alt="Profile"
              className="profile-image"
            />
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="profile-image-upload" className="upload-button">
              {loading ? "Uploading..." : "Change Photo"}
            </label>
          </div>
          <h2>{profile?.username || "User"}</h2>
        </div>

        <div className="profile-tabs">
          <div className="tabs-header">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === "personal" && (
              <>
                {!isEditing ? (
                  <div className="profile-details">
                    <div className="detail-item">
                      <label>Name</label>
                      <p>{profile?.name || "Not specified"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{profile?.email || "Not specified"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{profile?.contact_number || "Not specified"}</p>
                    </div>
                    <Button onClick={handleEditToggle}>Edit Profile</Button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-group">
                      <label>Name</label>
                      <Input
                        name="name"
                        value={profile?.name}
                        onChange={handleNameChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <Input
                        type="email"
                        name="email"
                        defaultValue={profile?.email}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        value={profile?.contact_number}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        required
                        className="phone-input-custom"
                        flags={flags}
                        countrySelectProps={{
                          className: "phone-input-country-select"
                        }}
                      />
                    </div>
                    <div className="form-buttons">
                      <Button type="submit">Save Changes</Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleEditToggle}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}

            {activeTab === "security" && (
              <form onSubmit={handlePasswordUpdate} className="profile-form">
                <Input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter your current password"
                  required
                />
                <Input
                  type="password"
                  name="newPassword"
                  placeholder="Enter your new password"
                  required
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  required
                />
                <Button type="submit">Update Password</Button>
              </form>
            )}
          </div>
        </div>

        <div className="profile-footer">
          <Button variant="danger" onClick={handleLogout} icon={<FiLogOut />}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
