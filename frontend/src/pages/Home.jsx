import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Workingwith from '../components/Workingwith';
import Casestudy from '../components/Casestudy';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import Footer from '../components/Footer';
import img from "../assets/about-1-left.jpg.png";
import img2 from "../assets/about-1-right.jpg.png";
import img3 from "../assets/about-1-right-2.jpg.png";
import img4 from "../assets/Container.png";
import img5 from "../assets/Container1.png";
import img6 from "../assets/about1-left-shape.png.png";
import img7 from "../assets/about1-right-top.png.png";
import img8 from "../assets/about1-right-bottom.png.png";
import img9 from "../assets/process-1.jpg.png";
import img10 from "../assets/process-1-shape.png.png";
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelopeOpenText, FaBalanceScale, FaPencilRuler } from "react-icons/fa";
import "../styles/pages/Home.css"

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic slider data
  const sliderData = [
    {
      subtitle: "Your Guardian In Law",
      title: "Experienced Attorneys, Trusted Results",
      clientCount: "10.2k+",
      reviews: "4.9k+",
      rating: 5,
      image: "/images/law-justice.jpg"
    },
    {
      subtitle: "Expert Legal Solutions",
      title: "Professional Legal Services & Consultation",
      clientCount: "8.5k+",
      reviews: "3.8k+",
      rating: 5,
      image: "/images/legal-consultation.jpg"
    },
    {
      subtitle: "Legal Excellence",
      title: "Dedicated Team of Law Professionals",
      clientCount: "12k+",
      reviews: "5.2k+",
      rating: 5,
      image: "/images/legal-team.jpg"
    }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length);
  };

  return (
    <>
      <Header />
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-slider">
            <div className="hero-content" style={{ transform: `translateY(-${currentSlide * 100}%)` }}>
              {sliderData.map((slide, index) => (
                <div key={index} className="slide">
                  <div className="slide-content">
                    <div className="hero-text">
                      <h4 className="subtitle">{slide.subtitle}</h4>
                      <h1 className="title">{slide.title}</h1>
                      <div className="client-review">
                        <div className="review-stats">
                          <span>We have {slide.clientCount} Happy Client</span>
                          <div className="stars">
                            {"★".repeat(slide.rating)} <span>({slide.reviews} Reviews)</span>
                          </div>
                        </div>
                      </div>
                      <button className="contact-btn">Contact Us →</button>
                    </div>
                    <div className="hero-image">
                      <img src={slide.image} alt="Legal services illustration" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="slider-controls">
              <div className="slider-dots">
                {sliderData.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
              <div className="slider-btn-container">
              <button className="slider-btn next" onClick={nextSlide}>↓</button>
              </div>
            </div>
          </div>
        </div>
       
        <div className="trusted-consultancy">
          <img src={img6} alt="Law Scale" className="img6" />
          <img src={img7} alt="Law Scale" className="img7" />
          <img src={img8} alt="Law Scale" className="img8" />
          <div className="trusted-container">
       <div className="trusted-left">
    <div className="image-group">
      <div className='img-left'>
      <img src={img} alt="Law Scale" className="img1" />
      </div>
      <div className='img-right'>
      <img src={img2} alt="Lawyer" className="img2" />
      <img src={img3} alt="Gavel on Books" className="img3" />
    </div>
    </div>
  </div>
  <div className="trusted-right">
    <p className="about-subtitle">About Us</p>
    <h2>Your Trusted Consultancy</h2>
    <p className="about-description">
    With years of experience, we provide expert legal services across various domains. Our mission is to offer strategic, client-focused legal solutions that protect your rights and interests.
    </p>
    <button className="more-about-btn">More About →</button>
  </div>
  </div>
        </div>

        <div className="achievement-bar">
  <div className="achievement-card">
    <i className="fas fa-balance-scale"></i>
    <div className="achievement-info">
      <h3>10k<span className="plus">+</span></h3>
      <p>Case Done</p>
    </div>
  </div>
  <div className="achievement-card">
    <i className="fas fa-user-tie"></i>
    <div className="achievement-info">
      <h3>12k<span className="plus">+</span></h3>
      <p>Expert Attorneys</p>
    </div>
  </div>
  <div className="achievement-card">
    <i className="fas fa-smile"></i>
    <div className="achievement-info">
      <h3>15k<span className="plus">+</span></h3>
      <p>Happy Client</p>
    </div>
  </div>
  <div className="achievement-card">
    <i className="fas fa-trophy"></i>
    <div className="achievement-info">
      <h3>20k<span className="plus">+</span></h3>
      <p>Award Winning</p>
    </div>
  </div>
        </div>

        <div className="services-section">
  <p className="services-subtitle">What We Do</p>
  <h2 className="services-title">Legal Services We Offer</h2>
  <div className="services-cards">
    <div className="service-card light">
      <h3>Compliance & Licensing</h3>
      <ul>
        <li>Factory Act License</li>
        <li>Digital Signature</li>
        <li>ESIC Registration</li>
        <li>Contract Labour Act</li>
        <li>Provident Fund Act</li>
        <li>Bombay Shop & Establishment Act</li>
        <li>Professional Tax</li>
        <li>Gratuity Act</li>
        <li>Bonus Act</li>
        <li>Employee's Compensation Act</li>
      </ul>
      <button className="get-started-btn">Get Started →</button>
    </div>

    <div className="service-card dark">
      <h3>Insurance</h3>
      <ul>
        <li>Motor & Vehicle</li>
        <li>Health Insurance</li>
        <li>Marine Ins</li>
        <li>Fire Ins</li>
        <li>Employee’s Compensation Policy</li>
      </ul>
      <button className="get-started-btn">Get Started →</button>
    </div>

    <div className="service-card light">
      <h3>Additional Services</h3>
      <ul>
        <li>Motor & Vehicle</li>
        <li>Health Insurance</li>
        <li>Marine Ins</li>
      </ul>
      <button className="get-started-btn">Get Started →</button>
    </div>
  </div>
        </div>

        <div className="lawyer-section">
<div className="hero-section">
        <div className="lawyer-content">
         <div className="lawyer-left">
         <p>Our Attorneys</p>
         <h1>Dedicated <br /> Lawyers, <br />Proven Results</h1>
         <button className="lawyer-btn">More Attorney →</button>
         </div>
         <div className="lawyer-right">
         <div className="lawyer-image">
         <img src={img4} alt="Lawyer" />
         <div className="overlay">   
              <div className="overlay-text">
                <h1>Sarah Rahman</h1>
                <p>Attorney</p>
                <div className="icon">
                <FaFacebook className="social-icon" />
                <FaInstagram className="social-icon" />
                <FaTwitter className="social-icon" />
                </div>
              </div>
            </div>
         </div>
         <div className="lawyer-image">
         <img src={img5} alt="Lawyer" />
         <div className="overlay">   
         <div className="overlay-text">
                <h1>Smith Miller</h1>
                <p>Attorney</p>
                <div className="icon">
                <FaFacebook className="social-icon" />
                <FaInstagram className="social-icon" />
                <FaTwitter className="social-icon" />
                </div>
              </div>
            </div>
         </div>
         </div>
        </div>
      </div>
        </div>

        <div className="why">
      {/* Left Section: Image with Play Button */}
      <div className="why-left">
        <div className="video-thumbnail">
          <img src={img9} alt="Gavel and Sand Timer" className="video-img" />
          <div className="play-button">
            <div className="circle">
              <div className="triangle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Content */}
      <div className="why-right">
      <img src={img10} alt="Law Scale" className="img10" />
        <p className="why-subtitle">Why Choose Us?</p>
        <h2 className="why-title">Navigating The Law: Your Assurance Of Peace</h2>

<div className="points">
        <div className="why-point">
          <div className="icon-circle"><FaEnvelopeOpenText /></div>
          <div>
            <h3>Initial Consultation</h3>
            <p>Our experienced lawyers thoroughly analyze the facts of each case. Then they apply the relevant laws to provide clear advice.</p>
          </div>
        </div>

        <div className="why-point">
          <div className="icon-circle"><FaBalanceScale /></div>
          <div>
            <h3>Case Evaluation</h3>
            <p>We prioritize understanding your concerns and aligning with your goals. Your satisfaction is our top priority.</p>
          </div>
        </div>

        <div className="why-point">
          <div className="icon-circle"><FaPencilRuler /></div>
          <div>
            <h3>Legal Strategy</h3>
            <p>We develop a customized plan to protect your rights and achieve the best possible outcome.</p>
          </div>
        </div>
        </div>
      </div>
    </div>

        <Workingwith />
        <div className="casestudy">
      <div className="casestudy-content">
            <p>Case Study</p>
            <h1>Attorney Legal Excellence in Action</h1>
        </div>
      <Casestudy />
        </div>
        <Testimonial />
        <Contact />
        <NewsUpdates />
      </div>
      <Footer />
    </>
  );
}

export default Home;
