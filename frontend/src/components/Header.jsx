import React from 'react';
import { HiPhone, HiEnvelope, HiMapPin, HiMagnifyingGlass, HiBars3 } from 'react-icons/hi2';
import { HiOutlineArrowSmallDown, HiOutlineArrowRight, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa'; // Updated to use react-icons/fa
import img from '../assets/@RADHE CONSULTANCY LOGO blue.png';
import '../styles/components/Header.css'; 

const Header = () => {
  return (
    <header>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-item">
            <HiPhone className="icon" />
            <span>+91 86963 56236</span>
          </div>
          <div className="top-bar-item">
            <HiEnvelope className="icon" />
            <span>info@radhe.com</span>
          </div>
          <div className="top-bar-item">
            <HiMapPin className="icon" />
            <span>105, 2, New Sonal Link Industries, Link Rd, Malad (west)</span>
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
        <div className="logo">
          <img src={img} alt="Radhe Consultancy" />
        </div>

        {/* Menu */}
        <nav className="nav-links">
          <div className="nav-item">
            Home <HiOutlineArrowSmallDown className="down-icon" />
          </div>
          <div className="nav-item">About Us</div>
          <div className="nav-item">
            Service <HiOutlineArrowSmallDown className="down-icon" />
          </div>
          <div className="nav-item">Career</div>
          <div className="nav-item">Blog</div>
          <div className="nav-item">Contact</div>
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
