import { Outlet } from 'react-router-dom';
import './DashboardLayout.css';

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Radhe CRM</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/dashboard/customers">Customers</a></li>
            <li><a href="/dashboard/leads">Leads</a></li>
            <li><a href="/dashboard/reports">Reports</a></li>
            <li><a href="/dashboard/settings">Settings</a></li>
          </ul>
        </nav>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-search">
            <input type="search" placeholder="Search..." />
          </div>
          <div className="header-actions">
            <button className="notifications-btn">Notifications</button>
            <button className="profile-btn">Profile</button>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;