import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaBuilding, FaTachometerAlt, FaUserCircle, FaBars, FaTimes, FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import '../../styles/dashboard/components/Sidebar.css';

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [vendorsDropdownOpen, setVendorsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1023) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/users', icon: <FaUsers />, label: 'Users' },
    {
      label: 'Vendors',
      icon: <FiUsers />,
      isDropdown: true,
      isOpen: vendorsDropdownOpen,
      toggle: () => setVendorsDropdownOpen(!vendorsDropdownOpen),
      items: [
        { path: '/vendors/company', icon: <FaBuilding />, label: 'Company Vendors' },
        { path: '/vendors/consumer', icon: <FaUsers />, label: 'Consumer Vendors' },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>


      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}
          ${isMobileMenuOpen ? 'sidebar-mobile-open' : 'sidebar-mobile'}`}
      >
        {/* Toggle Button */}
        <button
          className="sidebar-toggle"
          onClick={handleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>

        {/* Logo */}
        <div className="logo-container">
          <h1 className={`logo-text ${isCollapsed ? 'logo-collapsed' : ''}`}>
            {isCollapsed ? 'R' : 'Radhe'}
          </h1>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <div key={item.path || index}>
              {item.isDropdown ? (
                <div className="relative">
                  <button
                    onClick={item.toggle}
                    className="sidebar-nav-item"
                  >
                    <div className="flex items-center">
                      <span className="text-xl">{item.icon}</span>
                      <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                    </div>
                    {!isCollapsed && (
                      <span className="text-sm">
                        {item.isOpen ? <FaCaretUp /> : <FaCaretDown />}
                      </span>
                    )}
                  </button>
                  {item.isOpen && !isCollapsed && (
                    <div className="bg-[#1a4280]">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`sidebar-nav-item ${isActive(subItem.path) ? 'active' : ''}`}
                        >
                          <span className="text-lg">{subItem.icon}</span>
                          <span className="ml-4">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;