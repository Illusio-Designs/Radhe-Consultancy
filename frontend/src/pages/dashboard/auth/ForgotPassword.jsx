import { useState } from 'react';
import { authAPI } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../../styles/dashboard/Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await authAPI.forgotPassword(email);
      setSuccess('Check your email for the reset link.');
    } catch (err) {
      console.error('Error during forgot password:', err);

      const errorMessage = err.response?.data?.error || 'Failed to send reset link. Please try again later.';
      setError(errorMessage);
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
}

export default ForgotPassword;