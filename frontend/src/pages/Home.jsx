import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import Header from '../components/Header';
import Workingwith from '../components/Workingwith';
import Casestudy from '../components/Casestudy';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import Footer from '../components/Footer';
import Loader from '../components/common/Loader/Loader';
import OptimizedImage from '../components/OptimizedImage';
import TrustedConsultancy from '../components/home/TrustedConsultancy';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CaseStudySection from '../components/home/CaseStudySection';
import useThrottle from '../hooks/useThrottle';
import img from "../assets/about-1-left.webp";
import img2 from "../assets/about-1-right.webp";
import img3 from "../assets/about-1-right-2.webp";
import img4 from "../assets/Container.webp";
import img5 from "../assets/Container1.webp";
import img6 from "../assets/about1-left-shape.png.webp";
import img7 from "../assets/about1-right-top.png.webp";
import img8 from "../assets/about1-right-bottom.png.webp";
import img9 from "../assets/process-1.webp";
import img10 from "../assets/process-1-shape.png.webp";
import img11 from "../assets/hero-1-title-1.png.webp";
import img12 from "../assets/hero_1_2.webp";
// Import additional images for slider
import sliderImg1 from "../assets/business-people-busy-discussing-financial-matter-meeting.webp";
import sliderImg2 from "../assets/businessman-pointing-screen-showing-project-details-colleague.webp";
import sliderImg3 from "../assets/close-up-smiley-women-working.webp";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/pages/Home.css"

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleContactClick = useCallback(() => {
    window.location.href = '/contact';
  }, []);

  const handleAboutClick = useCallback(() => {
    window.location.href = '/about';
  }, []);

  // Dynamic slider data - memoized to prevent recreation
  const sliderData = useMemo(() => [
    {
      subtitle: "Your Guardian In Law",
      title: "Experienced Attorneys, Trusted Results",
      clientCount: "2k+",
      reviews: "35k+",
      rating: 5,
      image: sliderImg1
    },
    {
      subtitle: "Expert Legal Solutions",
      title: "Professional Legal Services & Consultation",
      clientCount: "2k+",
      reviews: "35k+",
      rating: 5,
      image: sliderImg2
    },
    {
      subtitle: "Legal Excellence",
      title: "Dedicated Team of Law Professionals",
      clientCount: "12k+",
      reviews: "35k+",
      rating: 5,
      image: sliderImg3
    }
  ], []);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSlide === sliderData.length - 1) {
        // When reaching last slide, disable transition and jump to first
        setIsTransitioning(false);
        setCurrentSlide(0);
        // Re-enable transition after a small delay
        setTimeout(() => {
          setIsTransitioning(true);
        }, 50);
      } else {
        setCurrentSlide(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, sliderData.length]);

  // Navigation functions - defined BEFORE they're used
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const isAtStart = container.scrollLeft <= 0;
    const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 10;
    
    // Only update if values actually changed to prevent re-renders
    setShowLeftArrow(prev => {
      const newValue = !isAtStart;
      return newValue === prev ? prev : newValue;
    });
    setShowRightArrow(prev => {
      const newValue = !isAtEnd;
      return newValue === prev ? prev : newValue;
    });
  }, []);
  
  // Throttle scroll position check to reduce re-renders
  const throttledCheckScrollPosition = useThrottle(checkScrollPosition, 200);

  const nextSlide = useCallback(() => {
    if (currentSlide === sliderData.length - 1) {
      setIsTransitioning(false);
      setCurrentSlide(0);
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, sliderData.length]);

  useEffect(() => {
    const checkWidth = () => {
      const mobile = window.innerWidth < 500;
      setIsMobile(prev => prev === mobile ? prev : mobile);
      checkScrollPosition();
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [checkScrollPosition]);

  const scrollLeft = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
    }
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-slider">
            <div 
              className="hero-content"
              style={{
                transform: `translateY(-${currentSlide * 100}%)`,
                transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
              }}
            >
              {sliderData.map((slide, index) => (
                <div key={index} className="slide">
                  <div className="slide-content">
                    <div className="hero-text">
                      <h4 className="subtitle">{slide.subtitle}</h4>
                      <h1 className="title">{slide.title}</h1>
                      <button className="contact-btn" onClick={handleContactClick}>Contact Us →</button>
                    </div>
                                         <div className="hero-image">
                       <OptimizedImage 
                         src={slide.image} 
                         alt="Legal services illustration"
                       />
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
       
        <TrustedConsultancy 
          img={img} 
          img2={img2} 
          img3={img3} 
          img6={img6} 
          img7={img7} 
          img8={img8}
          handleAboutClick={handleAboutClick}
        />

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
           <div className="services-cards" ref={scrollContainerRef} onScroll={throttledCheckScrollPosition}>
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
                <li>Employee's Compensation Policy</li>
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
          {isMobile && showLeftArrow && (
            <button 
              onClick={scrollLeft} 
              className="scroll-left-btn"
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
          )}
          {isMobile && showRightArrow && (
            <button 
              onClick={scrollRight} 
              className="scroll-right-btn"
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
        </div>

        <div className="lawyer-section">
        <div className="hero-section">
        <div className="lawyer-content">
         <div className="lawyer-left">
         <p>Our Attorneys</p>
         <h1>Dedicated Lawyers, Proven Results</h1>
         <button className="lawyer-btn">More Attorney →</button>
         </div>
        </div>
      </div>
        </div>
        

        <WhyChooseUs img9={img9} img10={img10} />

        <Workingwith />
        <CaseStudySection />
        <Testimonial />
        <Contact />
        <NewsUpdates />
     
      <Footer />
    </>
  );
}

export default Home;
