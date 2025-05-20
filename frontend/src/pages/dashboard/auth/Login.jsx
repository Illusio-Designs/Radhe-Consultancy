import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/pages/dashboard/auth/Auth.css";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { authAPI } from "../../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

console.log("Login component: Module loaded");

function Login() {
  console.log("Login component: Rendering");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Login component: Checking authentication state", {
      isAuthenticated,
    });
    if (isAuthenticated) {
      console.log(
        "Login component: User is already authenticated, redirecting to dashboard"
      );
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Login component: Form field changed", { field: name, value });
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login component: Form submission started");
    setError("");
    setLoading(true);

    try {
      console.log(
        "Login component: Submitting login form with email:",
        formData.email
      );
      
      // First try using the authAPI directly
      const response = await authAPI.login(formData.email, formData.password);
      console.log("Login component: Login successful, response:", response);
      
      // Then use the context login to update the auth state
      await login(formData.email, formData.password);
      
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login component: Login error:", err);
      const errorMessage = err.error || err.message || "Failed to login. Please check your credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setError("");
      setLoading(true);
      console.log("Login component: Google login response:", credentialResponse);
      
      const response = await authAPI.googleLogin(credentialResponse.credential);
      console.log("Login component: Google login successful, response:", response);
      
      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login component: Google login error:", err);
      const errorMessage = err.error || err.message || "Failed to authenticate with Google. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Login component: Google login failed:", error);
    const errorMessage = "Failed to connect with Google. Please try again.";
    setError(errorMessage);
    toast.error(errorMessage);
  };

  return (
    <div className="auth">
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

            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className={formData.password ? "has-value" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              className={`auth-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
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
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <p className="auth-redirect">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
