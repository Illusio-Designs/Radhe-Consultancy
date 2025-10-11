import React, { memo } from 'react';
import '../styles/components/Contact.css';
import OptimizedImage from './OptimizedImage';
import { FaUser, FaEnvelope, FaPhone, FaPen } from 'react-icons/fa';
import { HiOutlineArrowRight, HiPhone, HiEnvelope, HiMapPin } from 'react-icons/hi2';
import img from "../assets/contact-1-top.png.webp";

const Contact = () => {
  return (
    <div className="contact-container">
      <OptimizedImage src={img} alt="contact" className="contact-img" />
      {/* Left Side Form */}
      <div className="contact-form-section">
        <p className="form-subheading">Have Any Questions?</p>
        <h1 className="form-heading">Get In Touch With Us</h1>

        <div className="input-group field">
          <input type="text" placeholder="Name" />
          <FaUser className="input-icon" />
        </div>

        <div className="input-row">
          <div className="input-group">
            <input type="email" placeholder="Email" />
            <FaEnvelope className="input-icon" />
          </div>
          <div className="input-group call">
            <input type="tel" placeholder="Number" />
            <FaPhone className="input-icon" />
          </div>
        </div>

        <div className="input-group field">
          <textarea placeholder="Your Message" rows="6" style={{resize: 'none', scrollbarWidth: 'none'}}></textarea>
          <FaPen className="input-icon textarea-icon" />
        </div>

        <button className="send-button">
          Send Now <HiOutlineArrowRight className="right-arrow" />
        </button>
      </div>

      {/* Right Side Contact Info */}
      <div className="contact-info-section">
        <div className="info-box">
          <div className="info-icon location"><HiMapPin /></div>
          <div className="info-content">
            <h2>Location</h2>
            <p>1215 - 1216, RK Empire, Nr. Mavdi Circle, 150 feet Ring Road, Rajkot.</p>
            <br />
            <p>Branch office - Office no -16, 1st floor, Madhav Market,near Super market,Sanala Road,morbi,Gujarat</p>
          </div>
        </div>

        <div className="info-box">
          <div className="info-icon"><HiPhone /></div>
          <div className="info-content">
            <h2>Phone</h2>
            <p>+91 99130 14575</p>
          </div>
        </div>

        <div className="info-box">
          <div className="info-icon"><HiEnvelope /></div>
          <div className="info-content">
            <h2>Email</h2>
            <p>radheconsultancy17@yahoo.com </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Contact);
