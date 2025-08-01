import React, { useState, useEffect } from 'react';
import { HiPhone, HiEnvelope, HiMapPin, HiMagnifyingGlass } from 'react-icons/hi2';
import { HiOutlineArrowSmallDown, HiOutlineArrowRight, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import img from '../assets/@RADHE CONSULTANCY LOGO blue.png';
import '../styles/components/Header.css';

const MenuButton = ({ open, onClick }) => {
  const styles = {
    container: {
      height: '32px',
      width: '32px',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '4px',
      background: 'none',
      border: 'none',
    },
    line: {
      height: '2px',
      width: '20px',
      background: '#333',
      transition: 'all 0.2s ease',
    },
    lineTop: {
      transform: open ? 'rotate(45deg)' : 'none',
      transformOrigin: 'top left',
      marginBottom: '5px',
    },
    lineMiddle: {
      opacity: open ? 0 : 1,
      transform: open ? 'translateX(-16px)' : 'none',
    },
    lineBottom: {
      transform: open ? 'translateX(-1px) rotate(-45deg)' : 'none',
      transformOrigin: 'top left',
      marginTop: '5px',
    },
  };

  return (
    <button className="menu-btn" style={styles.container} onClick={onClick}>
      <div style={{ ...styles.line, ...styles.lineTop }} />
      <div style={{ ...styles.line, ...styles.lineMiddle }} />
      <div style={{ ...styles.line, ...styles.lineBottom }} />
    </button>
  );
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const [activePage, setActivePage] = useState('');

  useEffect(() => {
    setActivePage(location.pathname);
  }, [location]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-item">
            <HiPhone className="icon" />
            <a href="tel:+919913014575">+91 99130 14575</a>
          </div>
          <div className="top-bar-item">
            <HiEnvelope className="icon" />
            <a href="mailto:radheconsultancy17@yahoo.com">radheconsultancy17@yahoo.com </a>
          </div>
          <div className="top-bar-item">
            <HiMapPin className="icon" />
            <span>1215 - 1216, RK Empire, Nr. Mavdi Circle, 150 feet Ring Road, Rajkot.</span>
          </div>
        </div>
        <div className="top-bar-right">
          <FaFacebook className="social-icon" />
          <FaTwitter className="social-icon" />
          <FaYoutube className="social-icon" />
          <FaLinkedin className="social-icon" />
        </div>
      </div>

      {/* Main Navbar */}
      <div className="navbar">
        <div className="logo" onClick={() => window.location.href = '/'}>
          <img src={img} alt="Radhe Consultancy" />
        </div>

        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <div className={`nav-item ${activePage === '/' ? 'active' : ''}`} onClick={handleLinkClick}>
            <a href="/">Home</a>
          </div>
          <div className={`nav-item ${activePage === '/about' ? 'active' : ''}`} onClick={handleLinkClick}>
            <a href="/about">About Us</a>
          </div>
          <div className={`nav-item ${activePage === '/insurance' || activePage === '/compliance' ? 'active' : ''}`} onClick={toggleDropdown}>
            <a href="#">Service <HiOutlineArrowSmallDown className="down-icon" /></a>
            <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
              <a href="/insurance">Insurance</a>
              <a href="/compliance">Compliance & Licensing</a>
            </div>
          </div>
          <div className={`nav-item ${activePage === '/blog' || activePage === '/bloginner' ? 'active' : ''}`} onClick={handleLinkClick}>
            <a href="/blog">Blog</a>
          </div>
          <div className={`nav-item ${activePage === '/contact' ? 'active' : ''}`} onClick={handleLinkClick}>
            <a href="/contact">Contact</a>
          </div>
        </nav>

        <div className="nav-actions">
          <div className="search-container">
            <button className="search-btn" onClick={toggleSearch}>
              <HiOutlineMagnifyingGlass />
            </button>
            <div className={`search-bar ${isSearchOpen ? 'show' : ''}`}>
              <input type="text" placeholder="Search..." />
              <button className="search-submit">
                <HiOutlineMagnifyingGlass />
              </button>
            </div>
          </div>
          <button className="consult-btn">
            Free Consultation <HiOutlineArrowRight className="right-arrow" />
          </button>
          <MenuButton open={isMobileMenuOpen} onClick={toggleMobileMenu} />
        </div>
      </div>
    </header>
  );
};

export default Header;
