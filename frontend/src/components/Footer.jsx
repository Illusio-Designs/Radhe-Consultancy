import '../styles/components/Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Radhe Consultancy</h3>
          <p>Providing expert business solutions and professional services to help your business grow.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>Email: info@radheconsultancy.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Business Street, City, Country</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Radhe Consultancy. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;