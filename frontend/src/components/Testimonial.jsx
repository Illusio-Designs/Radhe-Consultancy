import React, { useState } from 'react';
import '../styles/components/Testimonial.css';

const testimonials = [
  {
    text: "I had been facing challenges with family law for months until I discovered abc. They not only resolved my issues effectively but also guided me on how to avoid similar problems in the future. Their team is highly skilled, patient, and always prioritizes customer satisfaction. I truly appreciate their support and would highly recommend them to others.",
    author: "Teresa Hamilton",
    role: "UI/UX Designer",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    text: "Navigating family law issues was overwhelming until I came across abc. They empowered me with knowledge to manage such situations better. Their expertise and dedication to client satisfaction left a lasting impression.",
    author: "Monks Millar",
    role: "UI/UX Designer",
    rating: 5
  },
  {
    text: "Best decision ever! abc helped me resolve complex family issues swiftly and professionally. I can't recommend them enough.",
    author: "John Doe",
    role: "Software Engineer",
    rating: 5
  },
  {
    text: "Superb experience! Professional, patient, and knowledgeable. abc made the whole process smooth and stress-free.",
    author: "Jane Smith",
    role: "Product Manager",
    rating: 5
  }
];

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 2) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 2 + testimonials.length) % testimonials.length);
  };

  // Get two testimonials based on currentIndex
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 2; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <div className="testimonial-container">
      <p className="section-title">Client Testimonials</p>

      <div className="testimonial-heading-nav">
        <h2 className="section-heading">What Our Clients Say</h2>
        <div className="testimonial-nav">
          <button className="nav-button" onClick={prevSlide}>←</button>
          <button className="nav-button" onClick={nextSlide}>→</button>
        </div>
      </div>

      <div className="testimonial-slider">
        {visibleTestimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="testimonial-header">
              <div>
                <h4 className="author-name">{testimonial.author}</h4>
                <p className="author-role">{testimonial.role}</p>
                <div className="author-rating">
                  {'★'.repeat(testimonial.rating)}
                </div>
              </div>
              <div className="quote-icon">❝</div>
            </div>
            <p className="testimonial-text">{testimonial.text}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Testimonial;
