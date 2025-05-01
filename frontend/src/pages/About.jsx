import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/pages/About.css';

const About = () => {
  return (
    <>
      <Header />
      <div className="page-container">
        <h1>About Us</h1>
        <div className="about-content">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>Radhe Consultancy is a leading business consultancy firm dedicated to providing comprehensive solutions to our clients.</p>
          </section>
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>To deliver exceptional consulting services that help businesses grow and succeed in today's competitive market.</p>
          </section>
          <section className="about-section">
            <h2>Our Vision</h2>
            <p>To be the most trusted and preferred consultancy partner for businesses across various industries.</p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About; 