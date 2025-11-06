import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function FooterSection() {
  const navigate = useNavigate();

  const handleStart = () => navigate("/intro?autoplay=true");

  return (
    <motion.footer
      className="footer-section"
      // initial={{ opacity: 0, y: 60 }}
      // whileInView={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.9, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.5 }}
    >
      <div className="footer-cta">
        <h2>이제, 당신의 아이 마음속 이야기를 만나볼 시간이에요</h2>
        <p>오늘, 단 한 번의 클릭으로 마법 같은 순간을 선물하세요 </p>
        <motion.button
          className="cta-btn"
          onClick={handleStart}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 8px 28px rgba(255, 155, 122, 0.6)",
          }}
          // transition={{ type: "spring", stiffness: 300 }}
        >
          이야기 만들기 시작하기
        </motion.button>
      </div>

      <div className="footer-links">
        <p>© 2025 Dinory. All Rights Reserved.</p>
        <div>
          <a href="#">이용약관</a> | <a href="#">개인정보처리방침</a> | <a href="#">문의하기</a>
        </div>
      </div>
    </motion.footer>
  );
}

export default FooterSection;
