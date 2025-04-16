import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="Logo" />
          </Link>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 