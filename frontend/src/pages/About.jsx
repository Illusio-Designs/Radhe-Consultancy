import React from 'react';
import '../styles/About.css';
import Navbar from '../components/Navbar';
import Footer from'../components/Footer';

const About = () => {
  return (
    <>
    <Navbar />
    <div className="about-container">
      <h1>About Radhe Consultancy</h1>
      <section className="about-content">
        <div className="mission-vision">
          <h2>Our Mission</h2>
          <p>To provide exceptional consulting services that empower businesses to achieve their full potential.</p>
          
          <h2>Our Vision</h2>
          <p>To be the leading consultancy firm known for innovative solutions and client success.</p>
        </div>
        
        <div className="values">
          <h2>Our Values</h2>
          <ul>
            <li>Excellence in Service</li>
            <li>Integrity & Trust</li>
            <li>Innovation</li>
            <li>Client-Centric Approach</li>
          </ul>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default About;