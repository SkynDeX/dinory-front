import React from "react";
import { useNavigate } from "react-router-dom";
import BookOrbitCarousel from "../../components/home/BookOrbitCarousel.jsx";
import "./HomePage.css";        
import "../../components/home/BookOrbitCarousel.css";

function HomePage() {
  return (
    <div className="homepage-fullscreen">
      <BookOrbitCarousel />
    </div>
  );
}

export default HomePage;
