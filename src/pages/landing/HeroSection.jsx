import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroKids from "../../assets/landing/hero-kids.png";

function HeroSection() {
  const navigate = useNavigate();

  const handleStart = () => navigate("/intro?autoplay=true");

  return (
    <section className="hero-section">

      <div className="hero-bg-glow" />

      <motion.div
        className="hero-text"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1>
          아이의 하루가 <br />
          이야기가 되는 순간,{" "}
          <span className="main-logo">
            <span className="green">Din</span>
            <span className="coral">o</span>
            <span className="sky">r</span>
            <span className="yellow">y</span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          작은 감정 하나가 동화가 되어, <br />
          세상에 단 하나뿐인 이야기를 선물합니다. <br />
          오늘, 아이의 마음속 세계를 만나보세요.
        </motion.p>

        <motion.button
          className="hero-btn"
          onClick={handleStart}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 8px 28px rgba(255, 155, 122, 0.6)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          이야기 시작하기
        </motion.button>

        <motion.div
          className="hero-users"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          
        </motion.div>
      </motion.div>

      {/* 메인 이미지 */}
      <motion.div
        className="hero-image"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <img src={heroKids} alt="Dinory 메인" />
      </motion.div>
    </section>
  );
}

export default HeroSection;
