import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaKey, FaBars } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/dashboard/components/Header.css'

const Header = ({ isCollapsed }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`header ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''} ${isSearchOpen ? 'search-open' : ''}`}>
      <div className="w-full flex justify-between items-center">
        {/* Left side - Menu and Title */}
        <div className="flex items-center gap-4">
          <h2 className="header-title">Dashboard</h2>
        </div>

        <div className="header-nav">
          <button className="header-nav-item">
            <FaBell />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="header-nav-item profile-button"
              aria-expanded={isProfileMenuOpen}
            >
              <FaUserCircle className="text-xl" />
              <span className="hidden md:inline">{user?.name || 'User'}</span>
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="dropdown-menu" role="menu">
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FaUserCircle className="text-lg" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/change-password"
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <FaKey className="text-lg" />
                    <span>Change Password</span>
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-red-500 hover:text-red-600 w-full"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;