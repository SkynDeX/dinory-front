import React from "react";
import { motion } from "framer-motion";
import howKid from "../../assets/landing/FAQ.png";

function HowItWorks() {
  const steps = [
    {
      title: "아이의 감정을 들려주세요",
      desc: "오늘의 기분, 상황, 또는 짧은 문장 하나면 충분해요.",
      color: "#ffd166",
    },
    {
      title: "이야기를 만들어 드릴게요",
      desc: "Dinory가 그 감정을 토대로 따뜻한 동화를 즉시 완성합니다.",
      color: "#ff9b7a",
    },
    {
      title: "함께 읽고, 함께 느껴요",
      desc: "완성된 이야기를 아이와 함께 읽으며 하루를 마무리해 보세요.",
      color: "#2fa36b",
    },
  ];

  return (
    <section className="how-section">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        이야기가 만들어지는 과정
      </motion.h2>

      <div className="how-flow">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className="how-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.3, duration: 0.8 }}
          >
            <div
              className="step-number"
              style={{
                backgroundColor: s.color + "33",
                color: s.color,
                boxShadow: `0 6px 14px ${s.color}55`,
              }}
            >
              {i + 1}
            </div>
            <h3 style={{ color: s.color }}>{s.title}</h3>
            <p>{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="how-character"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={howKid} alt="Dinory 캐릭터" />
      </motion.div>
    </section>
  );
}

export default HowItWorks;
