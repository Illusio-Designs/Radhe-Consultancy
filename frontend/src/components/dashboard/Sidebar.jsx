import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BiGroup,
  BiBuilding,
  BiTachometer,
  BiUser,
  BiMenu,
  BiX,
  BiCog,
  BiFolder,
  BiChevronDown,
  BiChevronUp
} from "react-icons/bi";
import img from "../../assets/@RADHE CONSULTANCY LOGO 1.png";
import "../../styles/dashboard/components/Sidebar.css";
import { roleAPI } from "../../services/api";

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({});

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

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          const roles = await roleAPI.getAllRoles();
          const userRole = roles.find(role => role.id === userData.role_id);
          setCurrentUserRole(userRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchCurrentUserRole();
  }, []);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  };

  const toggleDropdown = (label) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getMenuItems = () => {
    if (!currentUserRole) return [];

    switch (currentUserRole.role_name) {
      case 'admin':
        return [
          { path: "/dashboard", icon: <BiTachometer />, label: "Dashboard" },
          {
            label: "Users",
            icon: <BiGroup />,
            isDropdown: true,
            items: [
              {
                path: "/users",
                icon: <BiUser />,
                label: "All Users",
              },
              {
                path: "/users/company",
                icon: <BiBuilding />,
                label: "Company Users",
              },
              {
                path: "/users/consumer",
                icon: <BiGroup />,
                label: "Consumer Users",
              },
            ],
          },
          {
            label: "Companies",
            icon: <BiBuilding />,
            isDropdown: true,
            items: [
              {
                path: "/companies",
                icon: <BiBuilding />,
                label: "All Companies",
              },
            ],
          },
          {
            label: "Consumers",
            icon: <BiGroup />,
            isDropdown: true,
            items: [
              {
                path: "/consumers",
                icon: <BiGroup />,
                label: "All Consumers",
              },
            ],
          },
          { path: "/roles", icon: <BiUser />, label: "Roles" },
        ];

      case 'vendor_manager':
        return [
          { path: "/dashboard", icon: <BiTachometer />, label: "Dashboard" },
          {
            label: "Companies",
            icon: <BiBuilding />,
            isDropdown: true,
            items: [
              {
                path: "/companies",
                icon: <BiBuilding />,
                label: "All Companies",
              },
            ],
          },
        ];

      case 'user_manager':
        return [
          { path: "/dashboard", icon: <BiTachometer />, label: "Dashboard" },
          {
            label: "Users",
            icon: <BiGroup />,
            isDropdown: true,
            items: [
              {
                path: "/users",
                icon: <BiUser />,
                label: "All Users",
              },
              {
                path: "/users/company",
                icon: <BiBuilding />,
                label: "Company Users",
              },
              {
                path: "/users/consumer",
                icon: <BiGroup />,
                label: "Consumer Users",
              },
            ],
          },
          {
            label: "Consumers",
            icon: <BiGroup />,
            isDropdown: true,
            items: [
              {
                path: "/consumers",
                icon: <BiGroup />,
                label: "All Consumers",
              },
            ],
          },
        ];

      case 'company':
        return [
          { path: "/dashboard", icon: <BiTachometer />, label: "Dashboard" },
          {
            label: "Company",
            icon: <BiBuilding />,
            isDropdown: true,
            items: [
              {
                path: "/company/profile",
                icon: <BiUser />,
                label: "Profile",
              },
              {
                path: "/company/services",
                icon: <BiFolder />,
                label: "Services",
              },
            ],
          },
        ];

      case 'consumer':
        return [
          { path: "/dashboard", icon: <BiTachometer />, label: "Dashboard" },
          {
            label: "Consumer",
            icon: <BiUser />,
            isDropdown: true,
            items: [
              {
                path: "/consumer/profile",
                icon: <BiUser />,
                label: "Profile",
              },
              {
                path: "/consumer/services",
                icon: <BiFolder />,
                label: "Services",
              },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const renderMenuItem = (item, index) => {
    const isActive = location.pathname === item.path;
    const isDropdownActive = item.items?.some(subItem => location.pathname === subItem.path);

    if (item.isDropdown) {
      const isOpen = openDropdowns[item.label];
      return (
        <div key={index} className="sidebar-dropdown">
          <button
            className={`sidebar-dropdown-button ${isDropdownActive ? 'active' : ''}`}
            onClick={() => toggleDropdown(item.label)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="sidebar-label">{item.label}</span>
                {isOpen ? <BiChevronUp /> : <BiChevronDown />}
              </>
            )}
          </button>
          {isOpen && !isCollapsed && (
            <div className="sidebar-dropdown-content">
              {item.items.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  to={subItem.path}
                  className={`sidebar-dropdown-item ${location.pathname === subItem.path ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{subItem.icon}</span>
                  <span className="sidebar-label">{subItem.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={index}
        to={item.path}
        className={`sidebar-item ${isActive ? 'active' : ''}`}
      >
        <span className="sidebar-icon">{item.icon}</span>
        {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src={img} alt="Logo" className="sidebar-logo" />
        {!isCollapsed && <h1 className="sidebar-title">Radhe Consultancy</h1>}
      </div>

      <button className="sidebar-collapse-button" onClick={handleCollapse}>
        {isCollapsed ? <BiMenu /> : <BiX />}
      </button>

      <nav className="sidebar-nav">
        {getMenuItems().map((item, index) => renderMenuItem(item, index))}
      </nav>
    </div>
  );
};

export default Sidebar;
