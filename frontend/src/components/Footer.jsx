import React, { memo } from 'react';
import '../styles/components/Footer.css';
import OptimizedImage from './OptimizedImage';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import img from '../assets/@RADHE CONSULTANCY LOGO.webp';
import top from "../assets/footer-1-top.png.webp"

const Footer = () => {
  return (
    <div className="page-footer">
      <div className="newsletter">
        <div className="newsletter-content">
          <OptimizedImage src={top} alt="top" className="newsletter-top" />
          <h4>Newsletter</h4>
          <h2>Sign Up To Get Latest Update</h2>
        </div>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your Email" />
          <button>Subscribe →</button>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-col">
          <h4>Pages</h4>
          <div className="footer-col-links">
            <a href="/about">About Us</a>
            <a href="/blog">Our Blog</a>
            <a href="/contact">Contact Us</a> 
          </div>
        </div>
        <div className="footer-col">
          <h4>Our Services</h4>
          <div className="footer-col-links">
            <a href="/insurance">Insurance</a>
            <a href="/compliance">Compliance & Licensing</a>
          </div>
        </div>
        <div className="footer-col center-logo">
          <OptimizedImage src={img} alt="logo" className="footer-logo" />
          <p>Radhe Consultancy is your trusted partner in HR & Labor Law Compliance since 2016. We provide comprehensive compliance solutions, insurance services, and legal consultation across 7 branches in Gujarat.</p>
          <div className="social-icons">
            <div className="social-icon">
              <FaFacebookF />
            </div>
            <div className="social-icon">
              <FaTwitter />
            </div>
            <div className="social-icon">
              <FaInstagram />
            </div>
            <div className="social-icon">
              <FaLinkedinIn />
          </div>
          </div>
        </div>
        <div className="footer-col contact-info">
          <h4><FaMapMarkerAlt /> Location</h4>
          <p>1215 - 1216, RK Empire, Nr. Mavdi Circle, 150 feet Ring Road, Rajkot.</p>
            <br />
            <p>Branch office - Office no -16, 1st floor, Madhav Market,near Super market,Sanala Road,morbi,Gujarat</p>
          <h4><FaPhoneAlt /> Phone</h4>
          <a href="tel:+919913014575">+91 99130 14575</a>
          <h4><FaEnvelope /> Email</h4>
          <a href="mailto:radheconsultancy17@yahoo.com">radheconsultancy17@yahoo.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright <span>Radhe Consultancy</span> All Rights Reserved</p>
        <p>Design & Develop with ❤️ by - <a href="https://illusiodesigns.agency/" target="_blank" rel="noopener noreferrer">Illusio Designs</a></p>
      </div>
    </div>
  );
};

export default memo(Footer);
