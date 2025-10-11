import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Workingwith from '../components/Workingwith';
import Casestudy from '../components/Casestudy';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import NewsUpdates from '../components/NewsUpdates';
import Footer from '../components/Footer';
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
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelopeOpenText, FaBalanceScale, FaPencilRuler, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/pages/Home.css"

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const scrollContainerRef = useRef(null);

  const handleImageLoad = (imageSrc) => {
    setLoadedImages(prev => new Set([...prev, imageSrc]));
  };

  const handleContactClick = () => {
    window.location.href = '/contact';
  };

  const handleAboutClick = () => {
    window.location.href = '/about';
  };

  // Dynamic slider data
  const sliderData = [
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
  ];

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
  }, [currentSlide]);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 500);
      checkScrollPosition();
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Navigation functions
  const nextSlide = () => {
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
  };

  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -container.offsetWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: container.offsetWidth, behavior: 'smooth' });
    }
  };

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
                       {!loadedImages.has(slide.image) && (
                         <div 
                           style={{
                             filter: 'grayscale(100%)',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             color: '#999',
                             fontSize: '14px'
                           }}
                         >
                         </div>
                       )}
                       <img 
                         src={slide.image} 
                         alt="Legal services illustration" 
                         onLoad={() => handleImageLoad(slide.image)}
                         style={{
                           display: loadedImages.has(slide.image) ? 'block' : 'none',
                         }}
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
       
        <div className="trusted-consultancy">
                     {!loadedImages.has(img6) && (
             <div 
               className="img6" 
               style={{
                 backgroundColor: '#f0f0f0',
                 filter: 'grayscale(100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 color: '#999',
                 fontSize: '12px'
               }}
             >
               
             </div>
           )}
           <img 
             src={img6} 
             alt="Law Scale" 
             className="img6" 
             onLoad={() => handleImageLoad(img6)}
             style={{
               display: loadedImages.has(img6) ? 'block' : 'none'
             }}
           />
           {!loadedImages.has(img7) && (
             <div 
               className="img7" 
               style={{
                 backgroundColor: '#f0f0f0',
                 filter: 'grayscale(100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 color: '#999',
                 fontSize: '12px'
               }}
             >
               
             </div>
           )}
           <img 
             src={img7} 
             alt="Law Scale" 
             className="img7" 
             onLoad={() => handleImageLoad(img7)}
             style={{
               display: loadedImages.has(img7) ? 'block' : 'none'
             }}
           />
           {!loadedImages.has(img8) && (
             <div 
               className="img8" 
               style={{
                 backgroundColor: '#f0f0f0',
                 filter: 'grayscale(100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 color: '#999',
                 fontSize: '12px'
               }}
             >
               
             </div>
           )}
           <img 
             src={img8} 
             alt="Law Scale" 
             className="img8" 
             onLoad={() => handleImageLoad(img8)}
             style={{
               display: loadedImages.has(img8) ? 'block' : 'none'
             }}
           />
          <div className="trusted-container">
       <div className="trusted-left">
    <div className="image-group">
             <div className='img-left'>
       {!loadedImages.has(img) && (
         <div 
           className="img1" 
           style={{
             backgroundColor: '#f0f0f0',
             filter: 'grayscale(100%)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             color: '#999',
             fontSize: '12px'
           }}
         >
           
         </div>
       )}
       <img 
         src={img} 
         alt="Law Scale" 
         className="img1" 
         onLoad={() => handleImageLoad(img)}
         style={{
           display: loadedImages.has(img) ? 'block' : 'none'
         }}
       />
       </div>
       <div className='img-right'>
       {!loadedImages.has(img2) && (
         <div 
           className="img2" 
           style={{
             backgroundColor: '#f0f0f0',
             filter: 'grayscale(100%)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             color: '#999',
             fontSize: '12px'
           }}
         >
           
         </div>
       )}
       <img 
         src={img2} 
         alt="Lawyer" 
         className="img2" 
         onLoad={() => handleImageLoad(img2)}
         style={{
           display: loadedImages.has(img2) ? 'block' : 'none'
         }}
       />
       {!loadedImages.has(img3) && (
         <div 
           className="img3" 
           style={{
             backgroundColor: '#f0f0f0',
             filter: 'grayscale(100%)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             color: '#999',
             fontSize: '12px'
           }}
         >
           
         </div>
       )}
       <img 
         src={img3} 
         alt="Gavel on Books" 
         className="img3" 
         onLoad={() => handleImageLoad(img3)}
         style={{
           display: loadedImages.has(img3) ? 'block' : 'none'
         }}
       />
     </div>
    </div>
  </div>
  <div className="trusted-right">
    <p className="about-subtitle">About Us</p>
    <h2>Your Trusted Consultancy</h2>
    <p className="about-description">
    With years of experience, we provide expert legal services across various domains. Our mission is to offer strategic, client-focused legal solutions that protect your rights and interests.
    </p>
    <button className="more-about-btn" onClick={handleAboutClick}>More About →</button>
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
          <div className="services-cards" ref={scrollContainerRef} onScroll={checkScrollPosition}>
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
        

        <div className="why">
      {/* Left Section: Image with Play Button */}
      <div className="why-left">
        <div className="video-thumbnail">
                     {!loadedImages.has(img9) && (
             <div 
               className="video-img" 
               style={{
                 backgroundColor: '#f0f0f0',
                 filter: 'grayscale(100%)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 color: '#999',
                 fontSize: '14px'
               }}
             >
               
             </div>
           )}
           <img 
             src={img9} 
             alt="Gavel and Sand Timer" 
             className="video-img" 
             onLoad={() => handleImageLoad(img9)}
             style={{
               display: loadedImages.has(img9) ? 'block' : 'none'
             }}
           />
          <div className="play-button">
            <div className="circle">
              <div className="triangle"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Content */}
      <div className="why-right">
             {!loadedImages.has(img10) && (
         <div 
           className="img10" 
           style={{
             backgroundColor: '#f0f0f0',
             filter: 'grayscale(100%)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             color: '#999',
             fontSize: '12px'
           }}
         >
           
         </div>
       )}
       <img 
         src={img10} 
         alt="Law Scale" 
         className="img10" 
         onLoad={() => handleImageLoad(img10)}
         style={{
           display: loadedImages.has(img10) ? 'block' : 'none'
         }}
       />
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
     
      <Footer />
    </>
  );
}

export default Home;
