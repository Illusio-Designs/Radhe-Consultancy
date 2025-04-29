import React, { useState } from 'react'; // Added useState import
import '../styles/components/NewsUpdates.css';
import img from '../assets/blog-s-1-3-425x325.jpg.png';
import img2 from '../assets/blog-s-1-4-425x325.jpg.png';
import img3 from '../assets/blog-s-1-5-425x325.jpg.png';
import left from "../assets/blog-1-shape-left.png.png";
import right from "../assets/blog-1-shape-right.png.png";

const newsData = [
  {
    img: img,
    title: 'Experienced criminal defense ensures expert strategy,',
    author: 'Ensaf',
    date: '17 Dec, 2024',
    comments: 3,
  },
  {
    img: img2,
    title: 'Technology is transforming legal services with',
    author: 'Ensaf',
    date: '17 Dec, 2024',
    comments: 3,
  },
  {
    img: img3,
    title: 'Gain legal expertise, project management skills,',
    author: 'Ensaf',
    date: '17 Dec, 2024',
    comments: 3,
  },
];

const NewsUpdates = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Moved useState inside the component

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 2) % newsData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 2 + newsData.length) % newsData.length);
  };

  const getVisibleNews = () => {
    const visible = [];
    for (let i = 0; i < 2; i++) {
      const index = (currentIndex + i) % newsData.length;
      visible.push(newsData[index]);
    }
    return visible;
  };

  const visibleNews = getVisibleNews();

  return (
    <section className="news-section">
         <img src={left} alt="left" className="left-shape" />
         <img src={right} alt="right" className="right-shape" />
       <p className="section-title">News & Blog</p>

<div className="testimonial-heading-nav">
  <h2 className="section-heading">Our News & Update</h2>
  <div className="testimonial-nav">
    <button className="nav-button" onClick={prevSlide}>←</button>
    <button className="nav-button" onClick={nextSlide}>→</button>
  </div>
</div>
      <div className="news-cards">
        {newsData.map((item, index) => (
          <div className="news-card" key={index}>
            <img src={item.img} alt="news" className="news-image" />
            <div className="news-meta">
              <span>👤 By {item.author}</span>
              <span>📅 {item.date}</span>
              <span>💬 {item.comments} Comments</span>
            </div>
            <h1 className="news-title">{item.title}</h1>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewsUpdates;
