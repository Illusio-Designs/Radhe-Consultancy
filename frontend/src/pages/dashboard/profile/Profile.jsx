import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiBell, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Modal from '../../../components/common/Modal/Modal';
import Loader from '../../../components/common/Loader/Loader';
import {
  fetchUserProfile,
  updateUserProfile,
  updateProfileImage,
  updatePassword,
  updateNotificationSettings
} from '../../../services/profileService';
import '../../../styles/unwanted/Profile.css';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchUserProfile(userType);
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      await updateProfileImage(userType, formData);
      await loadProfile();
      setSuccess('Profile image updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const profileData = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      await updateUserProfile(userType, profileData);
      await loadProfile();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const passwordData = Object.fromEntries(formData.entries());

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(userType, passwordData);
      setSuccess('Password updated successfully');
      event.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const settings = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      await updateNotificationSettings(userType, settings);
      setSuccess('Notification settings updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear success/error messages after 5 seconds
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
    { id: 'personal', label: 'Personal Info', icon: <FiUser /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> }
  ];

  return (
    <div className="profile-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-uploader">
            <img
              src={profile?.imageUrl || '/default-avatar.png'}
              alt="Profile"
              className="profile-avatar"
            />
            <label className="upload-button">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
              Change Photo
            </label>
          </div>
          <h2>{profile?.name || 'User Profile'}</h2>
          <p className="text-muted">{userType?.charAt(0).toUpperCase() + userType?.slice(1)}</p>
        </div>

        <div className="profile-tabs">
          <div className="tabs-header">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'personal' && (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <Input
                  label="Name"
                  name="name"
                  defaultValue={profile?.name}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  defaultValue={profile?.email}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  name="phone"
                  defaultValue={profile?.phone}
                />
                <Button type="submit">Update Profile</Button>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handlePasswordUpdate} className="profile-form">
                <Input
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirmPassword"
                  required
                />
                <Button type="submit">Update Password</Button>
              </form>
            )}

            {activeTab === 'notifications' && (
              <form onSubmit={handleNotificationUpdate} className="profile-form">
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      defaultChecked={profile?.notifications?.email}
                    />
                    <span>Email Notifications</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      defaultChecked={profile?.notifications?.push}
                    />
                    <span>Push Notifications</span>
                  </label>
                </div>
                <Button type="submit">Update Notifications</Button>
              </form>
            )}
          </div>
        </div>

        <div className="profile-footer">
          <Button
            variant="danger"
            onClick={handleLogout}
            icon={<FiLogOut />}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 