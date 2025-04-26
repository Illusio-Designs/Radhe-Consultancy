import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiLock, FiBell, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button/Button";
import Input from "../../../components/common/Input/Input";
import Modal from "../../../components/common/Modal/Modal";
import Loader from "../../../components/common/Loader/Loader";
import {
  fetchUserProfile,
  updateUserProfile,
  updateProfileImage,
  updatePassword,
  updateNotificationSettings,
} from "../../../services/profileService";
import img from "../../../assets/img (1).png";
import "../../../styles/pages/dashboard/profile/Profile.css";
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

const PhoneNumberInput = ({ value, onChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const iti = intlTelInput(inputRef.current, {
      initialCountry: 'IN',
      utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
    });

    inputRef.current.addEventListener('change', () => {
      onChange(iti.getNumber());
    });

    return () => {
      iti.destroy();
    };
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="tel"
      placeholder="Enter phone number"
      required
    />
  );
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
    formData.append("image", file);

    try {
      setLoading(true);
      await updateProfileImage(userType, formData);
      await loadProfile();
      setSuccess("Profile image updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const profileData = Object.fromEntries(formData.entries());

    try {
      setLoading(true);
      await updateUserProfile(userType, profileData);
      await loadProfile();
      setSuccess("Profile updated successfully");
      setIsEditing(false);
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
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await updatePassword(userType, passwordData);
      setSuccess("Password updated successfully");
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
      setSuccess("Notification settings updated successfully");
    } catch (err) {
      setError(err.message);
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
    { id: "security", label: "Security", icon: <FiLock /> },
    { id: "notifications", label: "Notifications", icon: <FiBell /> },
  ];

  return (
    <div className="profile-page">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-uploader">
            <img
              src={profile?.imageUrl || img}
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
              Edit
            </label>
          </div>
          <h2>
            {profile?.role === "admin"
              ? profile?.username
              : profile?.role === "owner"
              ? profile?.owner_name
              : profile?.role === "consumer"
              ? profile?.name
              : "User"}
          </h2>
          <p className="text-muted">
            {userType?.charAt(0).toUpperCase() + userType?.slice(1)}
          </p>
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
                      <p>{profile?.name || "Not specified"}</p>
                    </div>
                    <div className="detail-item">
                      <p>{profile?.email || "Not specified"}</p>
                    </div>
                    <div className="detail-item">
                      <p>{profile?.phone || "Not specified"}</p>
                    </div>
                    <Button onClick={handleEditToggle}>Edit Profile</Button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <Input
                      name="name"
                      defaultValue={profile?.name}
                      placeholder="Enter your name"
                      required
                    />
                    <Input
                      type="email"
                      name="email"
                      defaultValue={profile?.email}
                      placeholder="Enter your email address"
                      required
                    />
                    <PhoneNumberInput
                      value={profile?.phone}
                      onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                    />
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

            {activeTab === "notifications" && (
              <form
                onSubmit={handleNotificationUpdate}
                className="profile-form"
              >
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
          <Button variant="danger" onClick={handleLogout} icon={<FiLogOut />}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
