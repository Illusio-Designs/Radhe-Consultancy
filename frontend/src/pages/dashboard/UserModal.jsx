import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';

function UserModal({ user, onClose, onUserUpdated }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User', // Default role
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role_id === 1 ? 'Admin' : 'User',
      });
    } else {
      setUserData({
        name: '',
        email: '',
        password: '',
        role: 'User',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        // Update existing user
        const updatedUser = await userAPI.updateUser(user.user_id, {
          username: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
        });
        onUserUpdated(updatedUser);
      } else {
        // Create new user
        const newUser = await userAPI.createUser({
          username: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
        });
        onUserUpdated(newUser);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
    }
  };

  return (
    <div className="modal">
      <h2>{user ? 'Edit User' : 'Add User'}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={userData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={userData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={userData.password} onChange={handleChange} />
        </div>
        <div>
          <label>Role:</label>
          <select name="role" value={userData.role} onChange={handleChange} required>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
        <button type="submit">{user ? 'Update User' : 'Add User'}</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}

export default UserModal; 