import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import Footer from '../components/dashboard/Footer';
import '../styles/layout/DashboardLayout.css';

function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Example notifications data
  const notifications = [
    { id: 1, text: "New user registered", time: "5 min ago" },
    { id: 2, text: "Server update completed", time: "1 hour ago" },
    { id: 3, text: "New report available", time: "3 hours ago" }
  ];
  
  // Example profile menu items
  const profileMenuItems = [
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
    { id: 'logout', label: 'Logout' }
  ];
  
  const handleProfileAction = (itemId) => {
    console.log(`Profile action: ${itemId}`);
    // Handle profile actions like logout, etc.
  };

  const handleSidebarCollapse = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  return (
    <div className="dashboard-main">
      <aside className="dashboard-sidebar">
        <Sidebar onCollapse={handleSidebarCollapse} />
      </aside>
      <div className={`dashboard-content ${isCollapsed ? 'content-collapsed' : ''}`}>
          <Header 
            isCollapsed={isCollapsed}
            notifications={notifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            onProfileAction={handleProfileAction}
            profileMenuItems={profileMenuItems}
          />
        <main className="dashboard-outlet">
          <Outlet />
        </main>
        <footer className="dashboard-footer">
          <Footer isCollapsed={isCollapsed} />
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;