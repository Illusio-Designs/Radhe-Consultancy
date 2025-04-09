import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login'); // Redirect to login page after logout
  };

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {/* Add more user information as needed */}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>No user information available. Please log in.</p>
      )}
    </div>
  );
}

export default Profile;