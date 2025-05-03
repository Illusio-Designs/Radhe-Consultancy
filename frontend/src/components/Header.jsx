import React, { useState, useEffect } from 'react';
import { HiPhone, HiEnvelope, HiMapPin, HiMagnifyingGlass, HiBars3 } from 'react-icons/hi2';
import { HiOutlineArrowSmallDown, HiOutlineArrowRight, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa'; // Updated to use react-icons/fa
import { useLocation } from 'react-router-dom';
import img from '../assets/@RADHE CONSULTANCY LOGO blue.png';
import '../styles/components/Header.css'; 

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const [activePage, setActivePage] = useState('');

  useEffect(() => {
    setActivePage(location.pathname);
  }, [location]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-item">
            <HiPhone className="icon" />
            <span>+91 99130 14575</span>
          </div>
          <div className="top-bar-item">
            <HiEnvelope className="icon" />
            <span>radheconsultancy17@yahoo.com </span>
          </div>
          <div className="top-bar-item">
            <HiMapPin className="icon" />
            <span>1215 - 1216, RK Empire, Nr. Mavdi Circle, 150 feet Ring Road, Rajkot.
            </span>
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
        {/* Logo */}
        <div className="logo" onClick={() => window.location.href = '/home'}>
          <img src={img} alt="Radhe Consultancy" />
        </div>

        {/* Menu */}
        <nav className="nav-links">
          <div className={`nav-item ${activePage === '/home' ? 'active' : ''}`}>
            <a href="/home">Home</a>
          </div>
          <div className={`nav-item ${activePage === '/about' ? 'active' : ''}`}>
            <a href="/about">About Us</a>
          </div>
          <div className={`nav-item ${activePage === '/insurance' || activePage === '/compliance' ? 'active' : ''}`} onClick={toggleDropdown}>
            <a href="#">Service <HiOutlineArrowSmallDown className="down-icon" /></a>
            <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
              <a href="/insurance">Insurance</a>
              <a href="/compliance">Compliance & Licensing</a>
            </div>
          </div>
          <div className={`nav-item ${activePage === '/blog' ? 'active' : ''}`}>
            <a href="/blog">Blog</a>
          </div>
          <div className={`nav-item ${activePage === '/contact' ? 'active' : ''}`}>
            <a href="/contact">Contact</a>
          </div>
        </nav>

        {/* Right side buttons */}
        <div className="nav-actions">
          <button className="search-btn">
            <HiOutlineMagnifyingGlass />
          </button>
          <button className="consult-btn">
            Free Consultation <HiOutlineArrowRight className="right-arrow" />
          </button>
          <button className="menu-btn">
            <HiBars3 />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
