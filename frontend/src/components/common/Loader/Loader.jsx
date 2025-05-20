import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "../../../assets/Animation - 1744885009403.json";

const LottieAnimation = ({ width = 150, height = 150, loop = true }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // 2000ms = 2 seconds

    return () => clearTimeout(timer); // Cleanup the timer
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
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        zIndex: 9999
      }}
    >
      <div style={{ width, height }}>
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