import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/dashboard/Auth.css";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.error || "Failed to login. Please check your credentials.");
      toast.error(err.error || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setError("");
      setLoading(true);
      // Implement Google login logic here
      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.error || "Failed to authenticate with Google. Please try again.");
      toast.error(err.error || "Failed to authenticate with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Google login failed:", error);
    setError("Failed to connect with Google. Please try again.");
    toast.error("Failed to connect with Google. Please try again.");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className={formData.email ? "has-value" : ""}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className={formData.password ? "has-value" : ""}
            />
          </div>

          <button type="submit" className={`auth-button ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            useOneTap
            flow="implicit"
            auto_select={false}
            context="signin"
          />
        </div>

        <p className="auth-redirect">
          <Link to="/auth/forgot-password">Forgot Password?</Link>
        </p>

        <p className="auth-redirect">
          Don't have an account? <Link to="/auth/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
