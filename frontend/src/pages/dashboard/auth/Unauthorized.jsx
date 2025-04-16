import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/pages/dashboard/auth/Auth.css";

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <div className="error-icon">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>
        <p>Sorry, you don't have permission to access this page.</p>
        {user ? (
          <div className="user-info">
            <p>
              You are logged in as: <strong>{user.email}</strong>
            </p>
            <p>
              Role: <strong>{user.role}</strong>
            </p>
          </div>
        ) : (
          <p>Please log in to access this page.</p>
        )}
        <div className="action-buttons">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          )}
          <Link to="/" className="btn btn-secondary">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
