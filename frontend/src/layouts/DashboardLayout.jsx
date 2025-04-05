import { Outlet, Link } from 'react-router-dom';
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
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/dashboard/customers">Customers</Link></li>
            <li><Link to="/dashboard/leads">Leads</Link></li>
            <li><Link to="/dashboard/reports">Reports</Link></li>
            <li><Link to="/dashboard/settings">Settings</Link></li>
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
            <Link to="/dashboard/profile">
              <button className="profile-btn">Profile</button>
            </Link>
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