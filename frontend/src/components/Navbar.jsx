import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div className="navbar-menu">
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="dropdown">
              <button
                className="dropdown-trigger"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span>{user?.username || 'User'}</span>
                <span className="icon">▼</span>
              </button>

              {isMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;