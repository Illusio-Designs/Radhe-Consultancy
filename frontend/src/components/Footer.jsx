import React from 'react';
import '../styles/components/Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import img from '../assets/@RADHE CONSULTANCY LOGO.png';

const Footer = () => {
  return (
    <div className="page-footer">
      <div className="newsletter">
        <div className="newsletter-content">
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
          <ul>
            <li>About Us</li>
            <li>Our Blog</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Our Services</h4>
          <ul>
            <li>Insurance</li>
            <li>Compliance & Licensing</li>
          </ul>
        </div>
        <div className="footer-col center-logo">
          <img src={img} alt="logo" className="footer-logo" />
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
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
          <p>+91 99130 14575</p>
          <h4><FaEnvelope /> Email</h4>
          <p>radheconsultancy17@yahoo.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright <span>Radhe Consultancy</span> All Rights Reserved</p>
        <p>Design & Develop with ❤️ by - Pixelvline Design Studio & Illusio Designs</p>
      </div>
    </div>
  );
};

export default Footer;
