import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Navbar.css';

function Navbar() {
  // TODO: Replace with actual auth state management
  const isAuthenticated = false;

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          Radhe Consultancy
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          ) : (
            <>
              <Link to="/auth/login" className="nav-link">Login</Link>
              <Link to="/auth/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;