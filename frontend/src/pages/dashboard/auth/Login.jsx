import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/pages/dashboard/auth/Auth.css";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { authAPI } from "../../../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

console.log("Login component: Module loaded");

function Login() {
  console.log("Login component: Rendering");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [loginMethod, setLoginMethod] = useState("email"); // "email", "google", or "whatsapp"
  const [otpSent, setOtpSent] = useState(false);
  const { login, isAuthenticated, loginWithGoogle } = useAuth();
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
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login component: Form submission started");
    setError("");
    setLoading(true);

    try {
      if (loginMethod === "email") {
        console.log(
          "Login component: Submitting login form with email:",
          formData.email
        );

        const response = await authAPI.login(formData.email, formData.password);
        await login(formData.email, formData.password);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else if (loginMethod === "whatsapp") {
        if (!otpSent) {
          await authAPI.sendWhatsAppOTP(formData.phone);
          setOtpSent(true);
          toast.success("OTP sent to your WhatsApp!");
        } else {
          const response = await authAPI.verifyWhatsAppOTP(
            formData.phone,
            formData.otp
          );
          toast.success("Login successful!");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);

      // Handle different types of errors
      if (!navigator.onLine) {
        setError(
          "No internet connection. Please check your network and try again."
        );
        toast.error(
          "Network connection error. Please check your internet connection."
        );
      } else if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.");
        toast.error("Invalid credentials");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
        toast.error("Server error. Please try again later.");
      } else if (err.message === "Network Error") {
        setError(
          "Unable to connect to the server. Please check your internet connection."
        );
        toast.error(
          "Network connection error. Please check your internet connection."
        );
      } else {
        setError(
          err.error ||
            err.message ||
            "An unexpected error occurred. Please try again."
        );
        toast.error(err.error || err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setError("");
      setLoading(true);
      console.log(
        "Login component: Google login response:",
        credentialResponse
      );

      const response = await authAPI.googleLogin(credentialResponse.credential);
      console.log(
        "Login component: Google login successful, response:",
        response
      );

      // Set in-memory auth state immediately
      if (response && response.user && response.token) {
        loginWithGoogle(response.user, response.token);
      }

      toast.success("Google login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);

      if (!navigator.onLine) {
        setError(
          "No internet connection. Please check your network and try again."
        );
        toast.error(
          "Network connection error. Please check your internet connection."
        );
      } else if (err.message === "Network Error") {
        setError(
          "Unable to connect to the server. Please check your internet connection."
        );
        toast.error(
          "Network connection error. Please check your internet connection."
        );
      } else {
        setError(
          err.error ||
            err.message ||
            "Failed to authenticate with Google. Please try again."
        );
        toast.error(
          err.error || err.message || "Failed to authenticate with Google"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Google login failed:", error);
    if (!navigator.onLine) {
      setError(
        "No internet connection. Please check your network and try again."
      );
      toast.error(
        "Network connection error. Please check your internet connection."
      );
    } else {
      setError("Failed to connect with Google. Please try again.");
      toast.error("Failed to connect with Google");
    }
  };

  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setOtpSent(false);
    setError("");
    setFormData({
      email: "",
      password: "",
      phone: "",
      otp: "",
    });
  };

  return (
    <div className="auth">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          <div className="login-methods">
            <button
              className={`login-method-btn ${
                loginMethod === "email" ? "active" : ""
              }`}
              onClick={() => switchLoginMethod("email")}
            >
              Email
            </button>
            <button
              className={`login-method-btn ${
                loginMethod === "whatsapp" ? "active" : ""
              }`}
              onClick={() => switchLoginMethod("whatsapp")}
            >
              Phone
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {loginMethod === "email" ? (
              <>
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={formData.phone}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, phone: value }))
                    }
                    placeholder="Enter your phone number"
                    required
                    className="insurance-form-input phone-input-custom"
                    flags={flags}
                  />
                </div>
                {otpSent && (
                  <div className="form-group">
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter OTP"
                      required
                      pattern="[0-9]{6}"
                      maxLength="6"
                      className={formData.otp ? "has-value" : ""}
                    />
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className={`auth-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : loginMethod === "whatsapp"
                ? otpSent
                  ? "Verify OTP"
                  : "Send OTP"
                : "Sign In"}
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
