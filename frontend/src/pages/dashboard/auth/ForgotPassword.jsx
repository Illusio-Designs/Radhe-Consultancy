import { useState } from "react";
import { authAPI } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../../styles/pages/dashboard/auth/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success("Password reset link has been sent to your email");
    } catch (err) {
      console.error("Error during forgot password:", err);
      toast.error(err.message || "Failed to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to reset your password</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          <button 
            className="auth-button" 
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <button
            className="auth-button"
            type="button"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
