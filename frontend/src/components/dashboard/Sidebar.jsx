import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserRound,
  UserCog,
  Store,
  ShieldCheck,
  Shield,
  HeartPulse,
  Flame,
  Car,
  HeartHandshake,
  BadgeCheck,
  Factory,
  ClipboardList,
  BookOpenCheck,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  ScanHeart,
  Clock,
  RefreshCw,
  Home,
} from "lucide-react";
import img from "../../assets/@RADHE CONSULTANCY LOGO.png";
import "../../styles/components/dashboard/Sidebar.css";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({ onCollapse }) => {
  console.log("Sidebar: Component rendering");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const { user } = useAuth();

  // Get all user roles as lowercase
  const userRoles = user?.roles?.map((r) => r.toLowerCase()) || [];
  const isRole = (role) => userRoles.includes(role.toLowerCase());
  // If only company or only consumer role, show nothing in sidebar
  const onlyCompanyOrConsumer =
    (userRoles.length === 1 && (isRole("company") || isRole("consumer"))) ||
    (userRoles.length === 2 && isRole("company") && isRole("consumer"));
  // Always show dashboard and renewals unless onlyCompanyOrConsumer
  let menuItems = [];
  if (!onlyCompanyOrConsumer) {
    menuItems = [
      {
        path: "/dashboard",
        icon: <LayoutDashboard />,
        label: "Dashboard",
      },
      {
        path: "/dashboard/renewals/list",
        icon: <RefreshCw />,
        label: "Renewals",
      },
    ];
  }

  // Debug logging for user data
  console.log("Sidebar: Raw user data:", user);
  console.log("Sidebar: User role_name:", user?.role_name);
  console.log("Sidebar: User role:", user?.role);

  // If only company or only consumer role, show nothing in sidebar
  if (onlyCompanyOrConsumer) {
    menuItems = [];
  } else if (isRole("admin")) {
    menuItems = [
      ...menuItems,
      {
        path: "/dashboard/users",
        label: "Users",
        icon: <Users />,
        isDropdown: true,
        isOpen: activeDropdown === "users",
        toggle: () => handleDropdownToggle("users"),
        items: [
          {
            path: "/dashboard/users/company",
            icon: <Building2 />,
            label: "Companies",
          },
          {
            path: "/dashboard/users/consumer",
            icon: <UserRound />,
            label: "Consumers",
          },
          {
            path: "/dashboard/users/other",
            icon: <UserCog />,
            label: "Employee",
          },
        ],
      },
      {
        path: "/dashboard/vendors",
        label: "Vendors",
        icon: <Store />,
        isDropdown: true,
        isOpen: activeDropdown === "vendors",
        toggle: () => handleDropdownToggle("vendors"),
        items: [
          {
            path: "/dashboard/companies",
            icon: <Building2 />,
            label: "Companies",
          },
          {
            path: "/dashboard/consumers",
            icon: <UserRound />,
            label: "Consumers",
          },
        ],
      },
      {
        path: "/dashboard/insurance",
        label: "Insurance",
        icon: <Shield />,
        isDropdown: true,
        isOpen: activeDropdown === "insurance",
        toggle: () => handleDropdownToggle("insurance"),
        items: [
          {
            path: "/dashboard/insurance/ECP",
            icon: <UserCog />,
            label: "ECP",
          },
          {
            path: "/dashboard/insurance/health",
            icon: <HeartPulse />,
            label: "Health",
          },
          {
            path: "/dashboard/insurance/fire",
            icon: <Flame />,
            label: "Fire",
          },
          {
            path: "/dashboard/insurance/vehicle",
            icon: <Car />,
            label: "Vehicle",
          },
          {
            path: "/dashboard/insurance/life",
            icon: <ScanHeart />,
            label: "Life",
          },
          {
            path: "/dashboard/insurance/companies",
            icon: <Building2 />,
            label: "Companies",
          },
        ],
      },
      {
        path: "/dashboard/compliance",
        label: "Compliance & Licensing",
        icon: <BadgeCheck />,
        isDropdown: true,
        isOpen: activeDropdown === "compliance",
        toggle: () => handleDropdownToggle("compliance"),
        items: [
          {
            path: "/dashboard/compliance/factory-act",
            icon: <Factory />,
            label: "Factory Act License",
          },
          {
            path: "/dashboard/compliance/labour-inspection",
            icon: <ClipboardList />,
            label: "Labour Law Inspection",
          },
          {
            path: "/dashboard/compliance/labour-license",
            icon: <BookOpenCheck />,
            label: "Labour License Management",
          },
        ],
      },
      { path: "/dashboard/dsc", icon: <KeyRound />, label: "DSC" },
      {
        label: "Logs",
        icon: <ClipboardList />,
        isDropdown: true,
        isOpen: activeDropdown === "logs",
        toggle: () => handleDropdownToggle("logs"),
        items: [
          {
            path: "/dashboard/dsc/logs",
            icon: <KeyRound />,
            label: "DSC Logs",
          },
        ],
      },
    ];
  } else {
    // For all other roles, add sections as needed
    if (isRole("user_manager") || isRole("user")) {
      menuItems.push({
        label: "Users",
        icon: <Users />,
        isDropdown: true,
        isOpen: activeDropdown === "users",
        toggle: () => handleDropdownToggle("users"),
        items: [
          {
            path: "/dashboard/users/company",
            icon: <Building2 />,
            label: "Companies",
          },
          {
            path: "/dashboard/users/consumer",
            icon: <UserRound />,
            label: "Consumers",
          },
          {
            path: "/dashboard/users/other",
            icon: <UserCog />,
            label: "Employee",
          },
        ],
      });
    }
    if (isRole("vendor_manager")) {
      menuItems.push({
        path: "/dashboard/vendors",
        label: "Vendors",
        icon: <Store />,
        isDropdown: true,
        isOpen: activeDropdown === "vendors",
        toggle: () => handleDropdownToggle("vendors"),
        items: [
          {
            path: "/dashboard/companies",
            icon: <Building2 />,
            label: "Companies",
          },
          {
            path: "/dashboard/consumers",
            icon: <UserRound />,
            label: "Consumers",
          },
        ],
      });
    }
    if (isRole("insurance_manager")) {
      menuItems.push({
        label: "Insurance",
        icon: <HeartPulse />,
        isDropdown: true,
        isOpen: activeDropdown === "insurance",
        toggle: () => handleDropdownToggle("insurance"),
        items: [
          {
            path: "/dashboard/insurance/ECP",
            icon: <HeartPulse />,
            label: "ECP",
          },
          {
            path: "/dashboard/insurance/health",
            icon: <HeartPulse />,
            label: "Health",
          },
          {
            path: "/dashboard/insurance/fire",
            icon: <Flame />,
            label: "Fire",
          },
          {
            path: "/dashboard/insurance/vehicle",
            icon: <Car />,
            label: "Vehicle",
          },
          {
            path: "/dashboard/insurance/life",
            icon: <HeartPulse />,
            label: "Life",
          },
          {
            path: "/dashboard/insurance/companies",
            icon: <Building2 />,
            label: "Companies",
          },
        ],
      });
    }
    if (isRole("compliance_manager")) {
      menuItems.push({
        label: "Compliance & Licensing",
        icon: <BadgeCheck />,
        isDropdown: true,
        isOpen: activeDropdown === "compliance",
        toggle: () => handleDropdownToggle("compliance"),
        items: [
          {
            path: "/dashboard/compliance/factory-act",
            icon: <Factory />,
            label: "Factory Act License",
          },
          {
            path: "/dashboard/compliance/labour-inspection",
            icon: <ClipboardList />,
            label: "Labour Law Inspection",
          },
          {
            path: "/dashboard/compliance/labour-license",
            icon: <BookOpenCheck />,
            label: "Labour License Management",
          },
        ],
      });
    }
    if (isRole("dsc_manager")) {
      // Show DSC page to dsc_manager
      menuItems.push({
        path: "/dashboard/dsc",
        icon: <KeyRound />,
        label: "DSC",
      });
    }
    // Only admin sees DSC Logs (already handled above in the admin block)
  }

  const isActive = (path) => {
    const active = location.pathname.startsWith(path);
    console.log("Sidebar: Checking if path is active:", { path, active });
    return active;
  };

  const handleDropdownToggle = (label) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onCollapse();
  };

  const renderMenuItem = (item, index) => {
    console.log("Sidebar: Rendering menu item:", { item, index });
    if (item.isDropdown) {
      return (
        <div key={`dropdown-${item.label}-${item.path || ""}-${index}`}>
          <a
            onClick={item.toggle}
            className={`sidebar-nav-item ${
              item.items && item.items.some((sub) => isActive(sub.path))
                ? "active"
                : ""
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
                  {item.isOpen ? <ChevronUp /> : <ChevronDown />}
                </span>
              </>
            )}
          </a>
          {item.items && item.items.length > 0 && (
            <div
              className={`pl-4 ${
                item.isOpen ? "dropdown-open" : "dropdown-close"
              }`}
            >
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

  console.log("Sidebar: Final menu items:", menuItems);

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
              {isCollapsed ? <Menu /> : <X />}
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
