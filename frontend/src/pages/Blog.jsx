import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Testimonial from '../components/Testimonial';
import Pagination from '../components/common/Pagination';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import img from "../assets/Mask group (1).png";
import img1 from "../assets/Mask group (2).png";
import '../styles/pages/Blog.css';

const blogPosts = [
  {
    id: 1,
    title: '23 cases have been successfully',
    image: img,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 2,
    title: '23 cases have been successfully',
    image: img1,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 3,
    title: '23 cases have been successfully',
    image: img,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 4,
    title: '23 cases have been successfully',
    image: img1,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 5,
    title: '23 cases have been successfully',
    image: img,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 6,
    title: '23 cases have been successfully',
    image: img1,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 7,
    title: '23 cases have been successfully',
    image: img,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 8,
    title: '23 cases have been successfully',
    image: img1,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 9,
    title: '23 cases have been successfully',
    image: img,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 10,
    title: '23 cases have been successfully',
    image: img1,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 11,
    title: '23 cases have been successfully',
    image: img,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  },
  {
    id: 12,
    title: '23 cases have been successfully',
    image: img1,
    excerpt: 'Lorem ipsum dolor sit amet consecter Commodo pulvinar molestie pellentesque urna libero'
  }
];

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  
  const getCurrentPosts = () => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return blogPosts.slice(startIndex, endIndex);
  };

  return (
    <>
      <Header />
      <div className="blog">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Blogs</h1>
        </div>
      </div>
        <div className="page-container">
          <p>News</p>
          <h1>The Latest News <br /> And Blog From Northman</h1>
          <div className="blog-grid">
            {getCurrentPosts().map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="blog-content">
                  <h2>{post.title}</h2>
                  <p className="blog-date">{post.date}</p>
                  <p className="blog-excerpt">{post.excerpt}</p>
                  <button className="read-more">Read More →</button>
                </div>
              </article>
            ))}
          </div>
          <div className="pagination-wrapper">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div> 
        <Testimonial />
      </div>
      <Footer />
    </>
  );
};

export default Blog; 