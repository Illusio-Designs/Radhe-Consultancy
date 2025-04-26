import React from "react";
import { FaTwitter, FaYoutube, FaPaperPlane } from "react-icons/fa";
import "../styles/pages/ComingSoon.css";
import img from "../assets/@RADHE CONSULTANCY LOGO 1.png";

const ComingSoon = () => {
  return (
    <>
    <div className="wrapper">
      <div className="wrapper-content">
      <h1>coming soon...</h1>
      <img src={img} alt="img" />
      <div className="icons">
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <FaTwitter />
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <FaYoutube />
        </a>
        <a
          href="https://example.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact"
        >
          <FaPaperPlane />
        </a>
      </div>
      </div>
    </div>
    </>
  );
};

export default ComingSoon;
