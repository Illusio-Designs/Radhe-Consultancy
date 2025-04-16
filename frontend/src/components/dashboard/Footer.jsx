import React from "react";
import { Link } from "react-router-dom";
import { BiSupport } from "react-icons/bi";
import "../../styles/components/dashboard/Footer.css";

function DashboardFooter({ isCollapsed }) {
  return (
    <footer className={`footer ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="footer-wrapper">
        <div className="footer-content">
          <div className="copyright">
            &copy; {new Date().getFullYear()} Radhe Consultancy
          </div>
          <nav className="footer-nav">
            <Link
              to="/dashboard/support"
              className="footer-link"
              title="Support"
            >
              <BiSupport /> Support
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default DashboardFooter;
