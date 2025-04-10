import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User Type:</strong> {user.user_type}</p>
          <p><strong>Role:</strong> {user.role_name}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>No user information available. Please log in.</p>
      )}
    </div>
  );
}

export default Profile;