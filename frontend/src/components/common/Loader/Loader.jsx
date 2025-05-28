import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "../../../assets/Animation - 1744885009403.json";

const LottieAnimation = ({ width = 150, height = 150, loop = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Consistent 3 seconds timing for all pages

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "#ffffff",
        zIndex: 1,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}
    >
      <div 
        style={{ 
          width, 
          height,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Lottie
          animationData={animationData}
          style={{ width: "100%", height: "100%" }}
          loop={loop}
          autoplay
        />
      </div>
    </div>
  );
};

export default LottieAnimation;