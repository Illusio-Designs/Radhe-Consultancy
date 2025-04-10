import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiBell, BiUser, BiLogOut, BiKey, BiSearch } from "react-icons/bi";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/dashboard/components/Header.css";

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
      <div className="w-full flex justify-between items-center px-4 py-2">
        {/* Left - Title */}
        <div className="items-center head">
          <h2 className="header-title text-xl font-semibold">Dashboard</h2>
          {/* Search Bar */}
          <div className="header-search">
            <BiSearch style={{ marginRight: "0.5rem" }} />
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        {/* Right - Search, Notifications, Profile */}
        <div className="items-center head">
          {/* Notification */}
          <button className="header-nav-item relative">
            <BiBell className="text-xl" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="header-nav-item flex items-center gap-1"
              aria-expanded={isProfileMenuOpen}
            >
              <BiUser className="text-xl" />
              <span className="hidden md:inline">{user?.name || "User"}</span>
            </button>

            {isProfileMenuOpen && (
              <div
                className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md z-10"
                role="menu"
              >
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <BiUser className="text-lg" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/change-password"
                    className="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <BiKey className="text-lg" />
                    <span>Change Password</span>
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100 w-full"
                  >
                    <BiLogOut className="text-lg" />
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
