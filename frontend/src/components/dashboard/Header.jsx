import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiBell, BiUser, BiLogOut, BiKey, BiSearch } from "react-icons/bi";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/components/dashboard/Header.css";

const Header = ({ isCollapsed }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className={`header ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="header-container">
        {/* Left - Title */}
        <div className="head">
          <h2 className="header-title">Dashboard</h2>
          {/* Search Bar */}
          <div className="header-search">
            <BiSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        {/* Right - Search, Notifications, Profile */}
        <div className="head">
          {/* Notification */}
          <button className="header-nav-item">
            <BiBell className="notification-icon" />
            <span className="notification-badge">3</span>
          </button>

          {/* Profile */}
          <div className="profile-menu" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="header-nav-item profile-button"
              aria-expanded={isProfileMenuOpen}
            >
              <BiUser className="profile-icon" />
              <span className="profile-username">
                {user?.role === "admin"
                  ? user?.username
                  : user?.role === "owner"
                  ? user?.owner_name
                  : user?.role === "consumer"
                  ? user?.name
                  : "User"}
              </span>
            </button>

            {isProfileMenuOpen && (
              <div className="dropdown-menu" role="menu">
                <div className="dropdown-content">
                  <Link
                    to="/dashboard/profile"
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <BiUser className="dropdown-icon" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/dashboard/change-password"
                    className="dropdown-item"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <BiKey className="dropdown-icon" />
                    <span>Change Password</span>
                  </Link>
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="custom-button
                   button-medium">
                    <BiLogOut className="dropdown-icon" />
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
