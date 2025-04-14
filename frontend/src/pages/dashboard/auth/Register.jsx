import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import "../../../styles/dashboard/Auth.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("All fields are required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(
        formData.username,
        formData.email,
        formData.password,
        2 // Default role_id
      );
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.error || error.message || "Failed to register. Please try again.";

      if (error.error === "Network error. Please check your connection.") {
        toast.error(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else if (error.error?.includes("email")) {
        toast.error(
          "This email is already registered. Please use a different email or try logging in."
        );
      } else if (error.error?.includes("username")) {
        toast.error(
          "This username is already taken. Please choose another username."
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Radhe CRM today</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className={formData.username ? "has-value" : ""}
            />
          </div>

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

          <div className="form-group">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className={formData.confirmPassword ? "has-value" : ""}
            />
          </div>

          <button
            type="submit"
            className={`auth-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-redirect">
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
