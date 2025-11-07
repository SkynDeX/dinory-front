import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroKids from "../../assets/landing/hero-kids.png";
import "./HeroSection.css";

function HeroSection() {
  const navigate = useNavigate();

  const handleStart = () => navigate("/intro?autoplay=true");

  useEffect(() => {
    const canvas = document.getElementById("hero-particles");
    const ctx = canvas.getContext("2d");

    let particles = [];
    const colors = ["#ff9b7a", "#ffd166", "#87ceeb", "#2fa36b"];
    const particleCount = 25;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 파티클 생성
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });
      requestAnimationFrame(draw);
    };
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <section className="hero-section">
      {/* 오로라 배경 추가 */}
      <div className="hero-aurora" />

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
        ></motion.div>
      </motion.div>

      {/* 메인 이미지 */}
      <motion.div
        className="hero-image"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <img src={heroKids} alt="Dinory 메인" />

        {/* 파티클 레이어 */}
        <canvas id="hero-particles" className="hero-particles"></canvas>
      </motion.div>
    </section>
  );
}

export default HeroSection;
