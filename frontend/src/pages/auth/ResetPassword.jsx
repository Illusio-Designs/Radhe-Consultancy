import { useState } from 'react';
import { authAPI } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await authAPI.resetPassword(token, password);
      setSuccess('Password has been reset successfully.');
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate('/auth/login'); // Redirect to login page
      }, 2000); // Optional: wait for 2 seconds before redirecting
    } catch (err) {
      console.error('Error during password reset:', err);
      const errorMessage = err.response?.data?.error || 'Failed to reset password.';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword; 