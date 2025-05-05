import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Testimonials from '../components/Testimonial';
import '../styles/pages/Bloginner.css';
import NewsUpdates from '../components/NewsUpdates';
import blog from '../assets/bloginner1.png';
import blog1 from '../assets/bloginner2.png';
import blog2 from '../assets/bloginner3.png';
import img from "../assets/Mask group (1).png";
import img1 from "../assets/Mask group (2).png";

const Bloginner = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const title = searchParams.get('title');

  return (
    <>
      <Header />
      <div className="bloginner">
        <div className="hero-section">
            <div className="hero-content">
                <h1>{title || 'Blog Post'}</h1>
            </div>
        </div>
      
        <div className="blogmain-wrapper">
      <div className="bloginner-image">
        <img src={blog} alt="blog" />
      </div>
      
      <div className="bloginner-content-wrapper">
        {/* Main Blog Content */}
        <div className="bloginner-main">
          <h2>23 Cases Have Been Successfully</h2>

          <p>Lorem ipsum dolor sit amet consectetur. Commodo pulvinar molestie pellentesque urna libero velit porta. Velit pellentesque hac gravida pellentesque est semper. Duis lectus gravida ultricies eleifend in pharetra faucibus orci sem. Proin ac a cursus praesent. Malesuada risus amet nunc posuere rhoncus accumsan congue id dolor. Convallis maecenas sed in pellentesque. Diam tristique semper mauris dolor amet. Dolor elit nunc et purus quam amet laoreet eu risus.Cum mattis mollis odio gravida adipiscing. Facilisis scelerisque non lacinia tincidunt faucibus tortor vel. Erat risus etiam quam pretium ornare. Semper orci arcu pulvinar adipiscing pretium.</p><br />

          <p>Erat facilisis dis arcu senectus sit mi fermentum eu aliquam. Felis neque posuere pharetra porttitor lacinia proin pretium. Et et pharetra tincidunt vel egestas risus sed mollis adipiscing. Lobortis risus mauris vitae pellentesque lobortis sapien. Mi convallis leo nisl pharetra quam arcu blandit. Metus nisl volutpat ut sed sit sit est. At molestie eu dictum ipsum pretium magna. Sed eget pretium lacus et fermentum nunc. Odio neque turpis tortor a pharetra a faucibus quis. A morbi sociis diam egestas varius id vitae suscipit. Cursus mauris hendrerit pellentesque erat gravida vel.Augue tristique quis fringilla.</p><br />

        <p>Erat pellentesque elementum consequat quis volutpat diam praesent molestie. Molestie scelerisque eleifend eu amet quam vitae fusce aliquam ornare. Accumsan est ut at tristique arcu. Semper lectus vulputate volutpat consectetur gravida ac gravida. Sem placerat pellentesque turpis tellus etiam porttitor sed. Scelerisque condimentum volutpat tempus lobortis. Accumsan dui felis turpis elementum. Leo nibh magnis sociis diam purus dui. Amet nulla urna curabitur consequat augue risus faucibus cursus. Egestas eros rutrum etiam mauris. Facilisis cras elementum diam bibendum.</p><br />

          <p>Magna facilisi egestas sapien phasellus consectetur arcu faucibus. Mattis sapien tellus id rutrum. Amet in nunc risus lectus nec turpis praesent et.Vehicula lacus convallis dui orci eget ultrices. Mi non et commodo ut mauris. Ultrices lectus tempor sed habitasse massa leo aliquam in sollicitudin. Vestibulum convallis aliquam morbi aliquam sit dolor faucibus neque cursus. Nullam tincidunt semper lorem interdum facilisis. Nullam aliquam nulla tortor egestas neque in. Eget sed leo tellus at convallis orci malesuada. Rhoncus vivamus amet nisl turpis in mauris. Et urna sed bibendum vivamus justo dignissim ut. Diam felis varius nisi in. Non sodales risus tempor orci ipsum consequat. Tristique leo risus convallis at vestibulum nascetur neque. </p><br />

          <p>Odio at arcu arcu aliquet orci morbi. Facilisis integer tincidunt sed pharetra mus scelerisque porta.Proin lorem egestas faucibus pulvinar a sapien nunc tellus. Venenatis velit consequat adipiscing posuere aliquet vel sit. Eu aliquet rhoncus mauris morbi. Mollis aliquet ut feugiat turpis duis cras. Lectus et mi eget est tincidunt lacus diam odio facilisis. Ullamcorper iaculis donec hac enim sit viverra vulputate. Massa mattis non molestie ullamcorper scelerisque est lectus non. Vestibulum vestibulum volutpat a ultrices. Arcu congue consectetur gravida in eget. Diam odio quis condimentum urna ultrices imperdiet eget. Sed aliquet ac quis tristique eu sit et vel.</p>

        </div>
        {/* Recommendation News Sidebar */}
        <div className="bloginner-sidebar">
          <h4>Recommendation News</h4>
          <div className="sidebar-news-item">
            <img src={img} alt="news" />
            <div>
              <h2>23 cases have been successfully</h2>
             <p>Lorem ipsum dolor sit amet. read more</p>
            </div>
          </div>
          <div className="sidebar-news-item">
            <img src={img1} alt="news" />
            <div>
              <h2>23 cases have been successfully</h2>
              <p>Lorem ipsum dolor sit amet. read more</p>
            </div>
          </div>
          <div className="sidebar-news-item">
            <img src={img} alt="news" />
            <div>
              <h2>23 cases have been successfully</h2>
              <p>Lorem ipsum dolor sit amet. read more</p>
            </div>
          </div>
        </div>
      </div>
      {/* Longest Handled Cases Section */}
      <div className="longest-cases-section">
        <h2>Longest Handled Cases</h2>
        <div className="longest-cases-cards">
          <div className="case-card">
            <img src={blog1} alt="case" />
            <h2>The Case of Giant Theft of Money at the Bank</h2>
          </div>
          <div className="case-card">
            <img src={blog2} alt="case" />
            <h2>Mysterious Murder Cases in Manila City</h2>
          </div>
        </div>
      </div>
        </div>
      </div>
   
      <NewsUpdates />
        <div className="help">
          <h1>We Help You With Quality Legal Lawyer</h1>
          <p>Lorem ipsum dolor sit amet consectetur. Commodo pulvinar molestie pellentesque urna libero velit porta. Velit pellentesque hac gravida pellentesque est semper. Duis lectus gravida ultricies eleifend in pharetra faucibus orci sem. </p>
          <div className="help-btn">Contact Now →</div>
        </div>
        <Testimonials />
      <Footer />
    </>
  );
};

export default Bloginner;
