import { useState } from 'react';
import { userAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await userAPI.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully.');

      // Redirect to login page after successful change
      setTimeout(() => {
        console.log('Redirecting to login page...');
        navigate('/auth/login'); // Redirect to login page
      }, 2000); // Optional: wait for 2 seconds before redirecting
    } catch (err) {
      console.error('Error during password change:', err);
      const errorMessage = err.response?.data?.error || 'Failed to change password.';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h1>Change Password</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default ChangePassword;