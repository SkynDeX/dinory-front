import React, { useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { gsap } from "gsap";
import dinoLoading from "../../assets/lottie/dinowalk.json";
import "./LoadingScreen.css";

export default function LoadingScreen({ message = "공룡 친구들을 불러오는 중이에요..." }) {
  useEffect(() => {
    // 별가루 랜덤 생성 애니메이션
    const stars = document.querySelectorAll(".star");
    stars.forEach((star) => {
      gsap.fromTo(
        star,
        {
          opacity: 0,
          y: 0,
          x: Math.random() * 300 - 150,
          scale: 0.5,
        },
        {
          opacity: 1,
          y: -80 - Math.random() * 80,
          duration: 2 + Math.random() * 1.5,
          repeat: -1,
          delay: Math.random() * 1.5,
          yoyo: true,
          ease: "power1.inOut",
        }
      );
    });
  }, []);

  return (
    <div className="loading-screen">
      {/* 버블 배경 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`bubble bubble-${i + 1}`} />
      ))}

      {/* 별가루 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="star" />
      ))}

      {/* 로티 애니메이션 */}
      <div className="loading-center">
        <Player autoplay loop src={dinoLoading} className="loading-lottie" />
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
}
