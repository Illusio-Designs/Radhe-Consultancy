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
  BiHealth,
  BiCertification,
  BiKey,
  BiPulse,
  BiWater,
  BiHotel,
  BiCar,
  BiBuildings,
  BiDetail,
  BiBook,
} from "react-icons/bi";
import img from "../../assets/@RADHE CONSULTANCY LOGO.png";
import "../../styles/components/dashboard/Sidebar.css";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ onCollapse }) => {
  console.log('Sidebar: Component rendering');
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Debug logging for user data
  console.log('Sidebar: Raw user data:', user);
  console.log('Sidebar: User role_name:', user?.role_name);
  console.log('Sidebar: User role:', user?.role);
  
  // Get role from user object, handling both role_name and role properties
  const userRole = user?.role_name || user?.role;
  console.log('Sidebar: Combined user role:', userRole);
  
  // Helper for case-insensitive role comparison
  const isRole = (role) => userRole && userRole.toLowerCase() === role.toLowerCase();

  // Set 'Users' dropdown open by default for admin
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Function to handle dropdown toggle
  const handleDropdownToggle = (dropdownName) => {
    console.log('Sidebar: Toggling dropdown:', dropdownName);
    setActiveDropdown((currentDropdown) =>
      currentDropdown === dropdownName ? null : dropdownName
    );
  };

  useEffect(() => {
    console.log('Sidebar: useEffect running');
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
    console.log('Sidebar: Toggling collapse state');
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  };

  let menuItems = [
    {
      path: "/dashboard",
      icon: <BiTachometer />,
      label: "Dashboard",
      items: [{ path: "/dashboard", icon: <BiTachometer />, label: "Home" }],
    },
  ];

  // Admin role has access to all features
  if (isRole("Admin")) {
    console.log('Sidebar: Setting admin menu items');
    menuItems = [
      {
        path: "/dashboard",
        icon: <BiTachometer />,
        label: "Dashboard",
        items: [{ path: "/dashboard", icon: <BiTachometer />, label: "Home" }],
      },
      {
        path: "/dashboard/users",
        label: "Users",
        icon: <BiGroup />,
        isDropdown: true,
        isOpen: activeDropdown === "users",
        toggle: () => handleDropdownToggle("users"),
        items: [
          {
            path: "/dashboard/users/company",
            icon: <BiBuilding />,
            label: "Companies",
          },
          {
            path: "/dashboard/users/consumer",
            icon: <BiUserCircle />,
            label: "Consumers",
          },
          {
            path: "/dashboard/users/other",
            icon: <BiUser />,
            label: "Employee",
          },
        ],
      },
      {
        path: "/dashboard/vendors",
        label: "Vendors",
        icon: <BiStore />,
        isDropdown: true,
        isOpen: activeDropdown === "vendors",
        toggle: () => handleDropdownToggle("vendors"),
        items: [
          {
            path: "/dashboard/companies",
            icon: <BiBuilding />,
            label: "Companies",
          },
          {
            path: "/dashboard/consumers",
            icon: <BiUserCircle />,
            label: "Consumers",
          },
        ],
      },
      {
        path: "/dashboard/insurance",
        label: "Insurance",
        icon: <BiHealth />,
        isDropdown: true,
        isOpen: activeDropdown === "insurance",
        toggle: () => handleDropdownToggle("insurance"),
        items: [
          {
            path: "/dashboard/insurance/ECP",
            icon: <BiHealth />,
            label: "ECP",
          },
          {
            path: "/dashboard/insurance/health",
            icon: <BiPulse />,
            label: "Health",
          },
          {
            path: "/dashboard/insurance/marine",
            icon: <BiWater />,
            label: "Marine",
          },
          {
            path: "/dashboard/insurance/fire",
            icon: <BiHotel />,
            label: "Fire",
          },
          {
            path: "/dashboard/insurance/vehicle",
            icon: <BiCar />,
            label: "Vehicle",
          },
          {
            path: "/dashboard/insurance/companies",
            icon: <BiBuilding />,
            label: "Companies",
          },
        ],
      },
      {
        path: "/dashboard/compliance",
        label: "Compliance & Licensing",
        icon: <BiCertification />,
        isDropdown: true,
        isOpen: activeDropdown === "compliance",
        toggle: () => handleDropdownToggle("compliance"),
        items: [
          {
            path: "/dashboard/compliance/factory-act",
            icon: <BiBuildings />,
            label: "Factory Act License",
          },
          {
            path: "/dashboard/compliance/labour-inspection",
            icon: <BiDetail />,
            label: "Labour Law Inspection",
          },
          {
            path: "/dashboard/compliance/labour-license",
            icon: <BiBook />,
            label: "Labour License Management",
          },
        ],
      },
      { path: "/dashboard/dsc", icon: <BiKey />, label: "DSC" },
    ];
    console.log('Sidebar: Admin menu items set:', menuItems);
  } else if (isRole("User_manager") || isRole("User")) {
    menuItems = [
      {
        path: "/dashboard",
        icon: <BiTachometer />,
        label: "Dashboard",
        items: [{ path: "/dashboard", icon: <BiTachometer />, label: "Home" }],
      },
      {
        label: "Users",
        icon: <BiGroup />,
        isDropdown: true,
        isOpen: activeDropdown === "users",
        toggle: () => handleDropdownToggle("users"),
        items: [
          {
            path: "/dashboard/users/company",
            icon: <BiBuilding />,
            label: "Companies",
          },
          {
            path: "/dashboard/users/consumer",
            icon: <BiUserCircle />,
            label: "Consumers",
          },
          {
            path: "/dashboard/users/other",
            icon: <BiUser />,
            label: "Employee",
          },
        ],
      },
    ];
  } else if (isRole("Vendor_manager")) {
    menuItems = [
      {
        path: "/dashboard",
        icon: <BiTachometer />,
        label: "Dashboard",
        items: [{ path: "/dashboard", icon: <BiTachometer />, label: "Home" }],
      },
      {
        label: "Vendors",
        icon: <BiStore />,
        isDropdown: true,
        isOpen: activeDropdown === "vendors",
        toggle: () => handleDropdownToggle("vendors"),
        items: [
          {
            path: "/dashboard/companies",
            icon: <BiBuilding />,
            label: "Companies",
          },
          {
            path: "/dashboard/consumers",
            icon: <BiUserCircle />,
            label: "Consumers",
          },
        ],
      },
    ];
  } else if (isRole("Insurance_manager")) {
    menuItems = [
      {
        path: "/dashboard",
        icon: <BiTachometer />,
        label: "Dashboard",
        items: [{ path: "/dashboard", icon: <BiTachometer />, label: "Home" }],
      },
      {
        label: "Insurance",
        icon: <BiHealth />,
        isDropdown: true,
        isOpen: activeDropdown === "insurance",
        toggle: () => handleDropdownToggle("insurance"),
        items: [
          {
            path: "/dashboard/insurance/ECP",
            icon: <BiHealth />,
            label: "ECP",
          },
          {
            path: "/dashboard/insurance/health",
            icon: <BiPulse />,
            label: "Health",
          },
          {
            path: "/dashboard/insurance/marine",
            icon: <BiWater />,
            label: "Marine",
          },
          {
            path: "/dashboard/insurance/fire",
            icon: <BiHotel />,
            label: "Fire",
          },
          {
            path: "/dashboard/insurance/vehicle",
            icon: <BiCar />,
            label: "Vehicle",
          },
          {
            path: "/dashboard/insurance/companies",
            icon: <BiBuilding />,
            label: "Companies",
          },
        ],
      },
    ];
  } else if (isRole("Compliance_manager")) {
    menuItems = [
      {
        path: "/dashboard",
        icon: <BiTachometer />,
        label: "Dashboard",
        items: [{ path: "/dashboard", icon: <BiTachometer />, label: "Home" }],
      },
      {
        label: "Compliance & Licensing",
        icon: <BiCertification />,
        isDropdown: true,
        isOpen: activeDropdown === "compliance",
        toggle: () => handleDropdownToggle("compliance"),
        items: [
          {
            path: "/dashboard/compliance/factory-act",
            icon: <BiBuildings />,
            label: "Factory Act License",
          },
          {
            path: "/dashboard/compliance/labour-inspection",
            icon: <BiDetail />,
            label: "Labour Law Inspection",
          },
          {
            path: "/dashboard/compliance/labour-license",
            icon: <BiBook />,
            label: "Labour License Management",
          },
        ],
      },
    ];
  } else if (isRole("DSC_manager")) {
    menuItems = [
      {
        path: "/dashboard",
        icon: <BiTachometer />,
        label: "Dashboard",
        items: [{ path: "/dashboard", icon: <BiTachometer />, label: "Home" }],
      },
      { path: "/dashboard/dsc", icon: <BiKey />, label: "DSC" },
    ];
  } else {
    console.log('Sidebar: Not a recognized role, using default menu items');
  }

  const isActive = (path) => {
    const active = location.pathname.startsWith(path);
    console.log('Sidebar: Checking if path is active:', { path, active });
    return active;
  };

  const renderMenuItem = (item, index) => {
    console.log('Sidebar: Rendering menu item:', { item, index });
    if (item.isDropdown) {
      return (
        <div key={`dropdown-${item.label}-${item.path || ''}-${index}`}>
          <a
            onClick={item.toggle}
            className={`sidebar-nav-item ${
              item.items && item.items.some((sub) => isActive(sub.path)) ? "active" : ""
            }`}
            title={isCollapsed ? item.label : ""}
          >
            <span className="text-2xl">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="ml-4 sidebar-nav-label">{item.label}</span>
                <span
                  className={`ml-4 text-sm chevron-icon ${
                    item.isOpen ? "rotate" : ""
                  }`}
                >
                  {item.isOpen ? <BiChevronUp /> : <BiChevronDown />}
                </span>
              </>
            )}
          </a>
          {item.items && item.items.length > 0 && (
            <div className={`pl-4 ${item.isOpen ? "dropdown-open" : "dropdown-close"}`}>
              {item.items.map((subItem, subIndex) =>
                subItem.isDropdown ? (
                  renderMenuItem(subItem, `${index}-${subIndex}`)
                ) : (
                  <Link
                    key={`${subItem.path}-${subIndex}`}
                    to={subItem.path}
                    className={`sidebar-nav-item ${
                      isActive(subItem.path) ? "active" : ""
                    }`}
                    title={isCollapsed ? subItem.label : ""}
                  >
                    <span className="text-lg">{subItem.icon}</span>
                    <span className="ml-4 sidebar-nav-label">
                      {subItem.label}
                    </span>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={`${item.path || index}`}
        to={item.path}
        className={`sidebar-nav-item ${isActive(item.path) ? "active" : ""}`}
        title={isCollapsed ? item.label : ""}
      >
        <span className="text-2xl">{item.icon}</span>
        {!isCollapsed && (
          <span className="ml-4 sidebar-nav-label">{item.label}</span>
        )}
      </Link>
    );
  };

  console.log('Sidebar: Final menu items:', menuItems);
  
  return (
    <>
      <div
        className={`sidebar ${
          isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
        } ${isMobileMenuOpen ? "sidebar-mobile-open" : "sidebar-mobile"}`}
      >
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
            {/* Move toggle button outside sidebar-content */}
            <button
              className="sidebar-toggle"
              onClick={handleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <BiMenu /> : <BiX />}
            </button>
          </div>

          {/* Navigation */}
          <div className="sidebar-nav">
            <nav className="mt-8">
              {menuItems.map((item, index) => renderMenuItem(item, index))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
