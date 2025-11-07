import React from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import parentLottie from "../../assets/landing/parent.json";  // 🔸 Lottie 파일 경로
import "./ParentSection.css";

function ParentSection() {
  return (
    <section className="parent-section">
      {/* 오로라 배경 */}
      <div className="parent-bg-glow" />

      {/* Lottie 애니메이션 */}
      <div className="parent-illustration-wrapper">
        <Lottie
          animationData={parentLottie}
          loop={true}
          autoplay={true}
          className="parent-illustration"
        />
      </div>

      <motion.div
        className="parent-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2>부모님을 위해</h2>
        <p>
          아이가 하루의 감정을 말로 다 표현하지 못할 때,<br />
          <strong>Dinory</strong>가 그 마음을 이야기로 전해드립니다.<br />
          감정과 상상을 잇는 다리,<br />
          사랑하는 아이에게 <span className="highlight">‘이해받는 시간’</span>을 선물하세요.
        </p>

        <motion.button
          className="parent-btn"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 8px 22px rgba(47, 163, 107, 0.4)",
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Dinory 스토리의 비밀 보기
        </motion.button>
      </motion.div>
    </section>
  );
}

export default ParentSection;
