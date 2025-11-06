import React from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

import lottie1 from "../../assets/landing/1.json";
import lottie2 from "../../assets/landing/2.json";
import lottie3 from "../../assets/landing/3.json";

function FeatureSection() {
  const features = [
    {
      animation: lottie1,
      title: "아이만의 감정을 담은 이야기",
      desc: "아이의 성격, 관심사, 그리고 그날의 감정을 반영해 단 한 권뿐인 맞춤형 동화가 탄생합니다.",
      color: "#2fa36b",
      glow: "0 0 30px rgba(47, 163, 107, 0.25)",
    },
    {
      animation: lottie2,
      title: "순식간에 완성되는 따뜻한 순간",
      desc: "단 몇 초, 한 줄의 문장으로도 완성도 높은 이야기가 피어납니다. 마치 마법처럼요.",
      color: "#ff9b7a",
      glow: "0 0 30px rgba(255, 155, 122, 0.25)",
    },
    {
      animation: lottie3,
      title: "끝없이 확장되는 상상 세계",
      desc: "아이의 상상력이 닿는 곳까지 Dinory가 함께 그려줍니다. 한 번의 이야기에서 무한한 세계가 펼쳐집니다.",
      color: "#87ceeb",
      glow: "0 0 30px rgba(135, 206, 235, 0.25)",
    },
  ];

  return (
    <section className="feature-section">
      <motion.h2
        className="feature-title"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        Dinory의 마법 같은 기능들
      </motion.h2>

      <div className="feature-cards">
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="feature-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.9 }}
            style={{ boxShadow: f.glow }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 50px ${f.color}50`,
            }}
          >
            <div className="lottie-wrapper">
              <Lottie
                animationData={f.animation}
                loop
                autoplay
                style={{ width: 220, height: 220 }}
              />
            </div>
            <h3 style={{ color: f.color }}>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default FeatureSection;
