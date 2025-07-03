import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiBell, BiUser, BiLogOut, BiKey, BiSearch, BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/components/dashboard/Header.css";
import SearchBar from "../common/SearchBar/SearchBar";

const Header = ({ isCollapsed, onSearch }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Add fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  return (
    <header className={`header ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="header-container">
        {/* Left - Title */}
        <div className="head">
          <h2 className="header-title">Dashboard</h2>
        </div>

        {/* Add SearchBar here */}
        <div className="header-searchbar">
          <SearchBar onSearch={onSearch} placeholder="Search..." />
        </div>

        {/* Right - Profile */}
        <div className="header-actions-right">
          {/* Fullscreen Toggle */}
          <button 
            className="header-nav-item fullscreen-button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <BiExitFullscreen className="fullscreen-icon" />
            ) : (
              <BiFullscreen className="fullscreen-icon" />
            )}
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
                {user?.username || "User"}
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
                  <button
                    onClick={handleLogout}
                    className="custom-button button-medium"
                  >
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
