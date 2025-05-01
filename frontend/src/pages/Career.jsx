import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/pages/Career.css';

const Career = () => {
  return (
    <>
      <Header />
      <div className="page-container">
        <h1>Career Opportunities</h1>
        <div className="career-content">
          <section className="career-intro">
            <h2>Join Our Team</h2>
            <p>We're always looking for talented individuals to join our growing team. Explore our current openings and start your journey with us.</p>
          </section>
          
          <section className="job-openings">
            <h2>Current Openings</h2>
            <div className="job-card">
              <h3>Business Consultant</h3>
              <p>Location: Rajkot</p>
              <p>Experience: 2-5 years</p>
              <button className="apply-btn">Apply Now</button>
            </div>
            <div className="job-card">
              <h3>Insurance Advisor</h3>
              <p>Location: Rajkot</p>
              <p>Experience: 1-3 years</p>
              <button className="apply-btn">Apply Now</button>
            </div>
            <div className="job-card">
              <h3>Compliance Officer</h3>
              <p>Location: Rajkot</p>
              <p>Experience: 3-5 years</p>
              <button className="apply-btn">Apply Now</button>
            </div>
          </section>

          <section className="benefits">
            <h2>Why Join Us?</h2>
            <ul>
              <li>Competitive Salary</li>
              <li>Professional Growth</li>
              <li>Work-Life Balance</li>
              <li>Learning Opportunities</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Career; 