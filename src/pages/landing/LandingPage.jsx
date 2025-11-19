import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroSection from "./HeroSection";
import VideoSection from "./VideoSection";
import FeatureSection from "./FeatureSection";
import ParentSection from "./ParentSection";
import HowItWorks from "./HowItWorks";
import FAQSection from "./FAQSection";
import FooterSection from "./FooterSection";
import ScrollToTopButton from "./ScrollToTopButton";
import "./Landing.css";

function LandingPage() {
  const { scrollYProgress } = useScroll();

  // Dinory 컬러 4단계로 부드럽게 그라데이션 변화
  const background = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["#fffefc", "#fefaf6", "#f9fcff", "#fffaf6", "#fffefc"]
  );

  return (
    <motion.main className="landing-container" style={{ background }}>
      <HeroSection />
      <VideoSection />
      <FeatureSection />
      <ParentSection />
      <HowItWorks />
      <FAQSection />
      <FooterSection />

      {/* 맨위로 가는 버튼!!!!! */}
      <ScrollToTopButton />
    </motion.main>
  );
}

export default LandingPage;
