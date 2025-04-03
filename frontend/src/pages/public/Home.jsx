import './Public.css';

function Home() {
  return (
    <div className="public-page home-page">
      <section className="hero-section">
        <h1>Welcome to Radhe Consultancy</h1>
        <p className="hero-subtitle">Your Trusted Partner in Business Growth</p>
        <div className="hero-actions">
          <a href="/contact" className="primary-btn">Get Started</a>
          <a href="/services" className="secondary-btn">Our Services</a>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Expert Guidance</h3>
            <p>Professional consultants with years of industry experience</p>
          </div>
          <div className="feature-card">
            <h3>Tailored Solutions</h3>
            <p>Customized strategies to meet your specific business needs</p>
          </div>
          <div className="feature-card">
            <h3>Proven Results</h3>
            <p>Track record of successful business transformations</p>
          </div>
          <div className="feature-card">
            <h3>24/7 Support</h3>
            <p>Round-the-clock assistance for your business needs</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Transform Your Business?</h2>
        <p>Let's work together to achieve your business goals</p>
        <a href="/contact" className="primary-btn">Contact Us Today</a>
      </section>
    </div>
  );
}

export default Home;