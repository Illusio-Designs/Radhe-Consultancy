import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiBell, BiUser, BiLogOut, BiKey, BiSearch, BiFullscreen, BiExitFullscreen } from "react-icons/bi";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/components/dashboard/Header.css";
import SearchBar from "../common/SearchBar/SearchBar";

const Header = ({ isCollapsed, onSearch, onToggleSidebar }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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

  const handleSearch = (searchQuery) => {
    setIsSearching(searchQuery.length >= 3);
    onSearch?.(searchQuery);
  };

  const handleToggleSidebar = () => {
    onToggleSidebar?.(!isCollapsed);
  };

  return (
    <header className={`header ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="header-container">
        {/* Left - Title and Toggle */}
        <div className="head">
          <button
            className="sidebar-toggle-header"
            onClick={handleToggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu /> : <X />}
          </button>
          <h2 className="header-title">Dashboard</h2>
        </div>

        {/* Center - Enhanced SearchBar */}
        <div className="header-searchbar">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search companies, policies, users..."
            minChars={3}
            showClearButton={true}
            showLoading={isSearching}
            className="header-searchbar-component"
          />
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
