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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to reset your password</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <button className="auth-button" type="submit">
            Send Reset Link
          </button>
          <button className="auth-button" type="button" onClick={() => navigate('/auth/login')}>
            Back to Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
