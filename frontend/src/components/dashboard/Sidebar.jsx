import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BiGroup,
  BiBuilding,
  BiTachometer,
  BiUser,
  BiMenu,
  BiX,
  BiChevronDown,
  BiChevronUp,
  BiShield,
  BiStore,
  BiUserCircle,
} from "react-icons/bi";
import img from "../../assets/@RADHE CONSULTANCY LOGO 1.png";
import "../../styles/components/dashboard/Sidebar.css";

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const [vendorsDropdownOpen, setVendorsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1023) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  };

  const menuItems = [
    { 
      path: "/dashboard", 
      icon: <BiTachometer />, 
      label: "Dashboard",
      items: [
        { path: "/dashboard", icon: <BiTachometer />, label: "Home" }
      ]
    },
    { path: "/dashboard/roles", icon: <BiShield />, label: "Roles" },
    { path: "/dashboard/widget", icon: <BiBuilding />, label: "Widget" },
    {
      label: "Users",
      icon: <BiUser />,
      isDropdown: true,
      isOpen: usersDropdownOpen,
      toggle: () => setUsersDropdownOpen(!usersDropdownOpen),
      items: [
        { path: "/dashboard/users/company", icon: <BiBuilding />, label: "Companies" },
        { path: "/dashboard/users/consumer", icon: <BiUserCircle />, label: "Consumer" },
        { path: "/dashboard/users/other", icon: <BiGroup />, label: "Employee" }
      ]
    },
    {
      label: "Vendors",
      icon: <BiStore />,
      isDropdown: true,
      isOpen: vendorsDropdownOpen,
      toggle: () => setVendorsDropdownOpen(!vendorsDropdownOpen),
      items: [
        { path: "/dashboard/companies", icon: <BiBuilding />, label: "Companies" },
        { path: "/dashboard/consumers", icon: <BiUserCircle />, label: "Consumers" }
      ]
    }
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const renderMenuItem = (item, index) => {
    if (item.isDropdown) {
      return (
        <div key={index} className="relative">
          <a
            onClick={item.toggle}
            className={`sidebar-nav-item ${
              item.items.some((sub) => isActive(sub.path))
                ? "active"
                : ""
            }`}
            data-tooltip={isCollapsed ? item.label : undefined}
          >
            <span className="text-2xl">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="ml-4 sidebar-nav-label">
                  {item.label}
                </span>
                <span className="ml-4 text-sm">
                  {item.isOpen ? <BiChevronUp /> : <BiChevronDown />}
                </span>
              </>
            )}
          </a>
          {item.isOpen && (
            <div className="pl-4">
              {item.items.map((subItem, subIndex) => (
                subItem.isDropdown ? (
                  renderMenuItem(subItem, `${index}-${subIndex}`)
                ) : (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    className={`sidebar-nav-item ${
                      isActive(subItem.path) ? "active" : ""
                    }`}
                  >
                    <span className="text-lg">{subItem.icon}</span>
                    <span className="ml-4 sidebar-nav-label">
                      {subItem.label}
                    </span>
                  </Link>
                )
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path || index}
        to={item.path}
        className={`sidebar-nav-item ${
          isActive(item.path) ? "active" : ""
        }`}
        data-tooltip={isCollapsed ? item.label : undefined}
      >
        <span className="text-2xl">{item.icon}</span>
        {!isCollapsed && (
          <span className="ml-4 sidebar-nav-label">{item.label}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      <div
        className={`sidebar ${
          isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
        } ${isMobileMenuOpen ? "sidebar-mobile-open" : "sidebar-mobile"}`}
      >
        {/* Move toggle button outside sidebar-content */}
        <button
          className="sidebar-toggle"
          onClick={handleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <BiMenu /> : <BiX />}
        </button>

        <div className="sidebar-content">
          {/* Logo */}
          <div className="logo-container">
            <h1 className={`logo-text ${isCollapsed ? "logo-collapsed" : ""}`}>
              {isCollapsed ? (
                <img src={img} alt="img" className="collapsed-img" />
              ) : (
                <img src={img} alt="img" className="main" />
              )}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="mt-8">
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
