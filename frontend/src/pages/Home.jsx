import React from 'react';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Radhe Consultancy</h1>
      <p>Your trusted partner in professional consulting services</p>
      <section className="services-preview">
        <h2>Our Services</h2>
        <div className="services-grid">
          {/* Service preview cards will be added here */}
        </div>
      </section>
    </div>
  );
};

export default Home;