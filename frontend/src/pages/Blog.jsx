import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Testimonial from '../components/Testimonial';
import Pagination from '../components/common/Pagination';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import '../styles/pages/Blog.css';

const blogPosts = [
  {
    id: 1,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-statue.jpg',
    date: 'March 15, 2024',
    excerpt: 'Latest updates and developments in the legal industry...'
  },
  {
    id: 2,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-consultation.jpg',
    date: 'March 14, 2024',
    excerpt: 'Professional legal consultation services for your needs...'
  },
  {
    id: 3,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-gavel.jpg',
    date: 'March 13, 2024',
    excerpt: 'Understanding the latest legal precedents and rulings...'
  },
  {
    id: 4,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-books.jpg',
    date: 'March 12, 2024',
    excerpt: 'Resources and knowledge for legal professionals...'
  },
  {
    id: 5,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-team.jpg',
    date: 'March 11, 2024',
    excerpt: 'Meet our experienced team of legal experts...'
  },
  {
    id: 6,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-document.jpg',
    date: 'March 10, 2024',
    excerpt: 'Important documentation and compliance updates...'
  },
  {
    id: 7,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-office.jpg',
    date: 'March 9, 2024',
    excerpt: 'Modern legal services for modern businesses...'
  },
  {
    id: 8,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-handshake.jpg',
    date: 'March 8, 2024',
    excerpt: 'Building strong partnerships with our clients...'
  },
  {
    id: 9,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-tech.jpg',
    date: 'March 7, 2024',
    excerpt: 'Leveraging technology in legal services...'
  },
  {
    id: 10,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-meeting.jpg',
    date: 'March 6, 2024',
    excerpt: 'Strategic legal planning and consultation...'
  },
  {
    id: 11,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-research.jpg',
    date: 'March 5, 2024',
    excerpt: 'In-depth legal research and analysis...'
  },
  {
    id: 12,
    title: 'Latest News From Northman',
    image: '/images/blog/legal-contract.jpg',
    date: 'March 4, 2024',
    excerpt: 'Contract law and business agreements...'
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
                  <button className="read-more">Read More  <HiOutlineArrowRight className="right-arrow" /></button>
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