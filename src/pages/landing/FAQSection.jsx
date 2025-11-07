import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import "./FAQSection.css";

function FAQSection() {
  const faqs = [
    {
      q: "Dinory는 어떤 원리로 동화를 만들어요?",
      a: "Dinory는 아이의 감정과 하루의 이야기를 분석해, 그날의 기분에 맞는 맞춤형 동화를 생성합니다.",
    },
    {
      q: "정말 몇 초 만에 이야기가 완성되나요?",
      a: "네, 단 몇 초면 충분해요. 아이의 한마디가 마법처럼 이야기로 피어납니다.",
    },
    {
      q: "아이의 데이터는 안전하게 보호되나요?",
      a: "모든 감정 데이터와 사용자 정보는 암호화되어 안전하게 저장되며, 외부로 공유되지 않습니다.",
    },
    {
      q: "무료로 사용할 수 있나요?",
      a: "네, 기본 스토리 생성은 무료로 이용하실 수 있으며, 프리미엄 기능은 선택적으로 제공됩니다.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="faq-section">
      <motion.h2
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        자주 묻는 질문
      </motion.h2>

      <div className="faq-container">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            className={`faq-card ${openIndex === i ? "open" : ""}`}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <button
              className="faq-header"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span className="faq-question">{faq.q}</span>
              <motion.div
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown
                  size={22}
                  color={openIndex === i ? "#ff9b7a" : "#2fa36b"}
                />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  className="faq-answer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p>{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default FAQSection;
