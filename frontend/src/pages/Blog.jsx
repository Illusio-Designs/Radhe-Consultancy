import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Testimonial from '../components/Testimonial';
import '../styles/pages/Blog.css';

const Blog = () => {
  return (
    <>
      <Header />
      <div className="blog">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Insurance</h1>
        </div>
      </div>
      <div className="page-container">
        <h1>Blog & News</h1>
        <div className="blog-grid">
          <article className="blog-card">
            <div className="blog-image">
              <img src="/placeholder-image.jpg" alt="Blog post" />
            </div>
            <div className="blog-content">
              <h2>Understanding Business Insurance</h2>
              <p className="blog-date">March 15, 2024</p>
              <p className="blog-excerpt">Learn about the different types of business insurance and how they can protect your company...</p>
              <a href="#" className="read-more">Read More</a>
            </div>
          </article>

          <article className="blog-card">
            <div className="blog-image">
              <img src="/placeholder-image.jpg" alt="Blog post" />
            </div>
            <div className="blog-content">
              <h2>Compliance Updates 2024</h2>
              <p className="blog-date">March 10, 2024</p>
              <p className="blog-excerpt">Stay updated with the latest compliance requirements for businesses in 2024...</p>
              <a href="#" className="read-more">Read More</a>
            </div>
          </article>

          <article className="blog-card">
            <div className="blog-image">
              <img src="/placeholder-image.jpg" alt="Blog post" />
            </div>
            <div className="blog-content">
              <h2>Financial Planning Tips</h2>
              <p className="blog-date">March 5, 2024</p>
              <p className="blog-excerpt">Essential financial planning strategies for small business owners...</p>
              <a href="#" className="read-more">Read More</a>
            </div>
          </article>
        </div>
      </div>
      <Testimonial />
      </div>
      <Footer />
    </>
  );
};

export default Blog; 