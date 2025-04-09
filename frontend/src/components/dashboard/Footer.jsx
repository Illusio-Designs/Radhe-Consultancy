import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/dashboard/components/Footer.css'

function DashboardFooter({ isCollapsed }) {
  return (
    <footer className={`footer ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="footer-wrapper">
        <div className="footer-content">
          <div className="copyright">
            &copy; {new Date().getFullYear()} Radhe Consultancy
          </div>
          <nav className="footer-nav">
            <Link to="/dashboard/help" className="footer-link" title="Help">Help</Link>
            <Link to="/dashboard/settings" className="footer-link" title="Settings">Settings</Link>
            <Link to="/dashboard/support" className="footer-link" title="Support">Support</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default DashboardFooter;