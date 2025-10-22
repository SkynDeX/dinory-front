import React from "react";
import { useNavigate } from "react-router-dom";
import BookOrbitCarousel from "../../components/BookOrbitCarousel.jsx";
import "./HomePage.css";        
import "../../components/BookOrbitCarousel.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-wrapper">
      {/* 헤더. 로고랑 네비 */}
      <header className="homepage-header">
        <h1 className="logo">
          <span className="green">Din</span>
          <span className="coral">o</span>
          <span className="sky">r</span>
          <span className="yellow">y</span>
        </h1>

        <nav className="nav-menu">
          <button onClick={() => navigate("/home")}>개발자님들 @ 테스트 @ 여기입니다!!</button>
          <button onClick={() => navigate("")}>뭐 넣을까요</button>
          <button onClick={() => navigate("")}>추천좀요</button>
          <button onClick={() => navigate("")}>화이팅</button>
        </nav>
      </header>

      {/* 메인 캐러셀 섹션부분 */}
      <section className="hero-section">
        <BookOrbitCarousel />
      </section>
    </div>
  );
};

export default HomePage;
