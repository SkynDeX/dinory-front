import React, { useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import "./EggHatchModal.css";

// 부화 영상
import eggVideo from "../assets/egg.mp4";

// 실제 Lottie 공룡 파일 import
import redTRex from "../assets/lottie/red-t-rex.json";
import shortDiplodocus from "../assets/lottie/short-diplodocus.json";
import pteranodon from "../assets/lottie/pteranodon.json";
import triceratops from "../assets/lottie/triceratops.json";

// 공룡 종류 매핑
const dinoMap = {
  red: redTRex,
  diplo: shortDiplodocus,
  ptera: pteranodon,
  trice: triceratops,
};

function EggHatchModal({ color, name, onClose }) {
  const [showDino, setShowDino] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // 영상 끝나면 공룡 등장
  const handleVideoEnd = () => {
    setShowDino(true);
  };

  // 공룡이 등장하면 3초 후 자동 닫기 (fade-out)
  useEffect(() => {
    if (showDino) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(onClose, 1200); // fade-out 후 닫기
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDino, onClose]);

  return (
    <div className={`hatch-overlay ${fadeOut ? "fade-out" : ""}`}>
      <div className="hatch-content">
        {!showDino ? (
          <video
            src={eggVideo}
            autoPlay
            playsInline
            muted={false}
            className="hatch-video"
            onEnded={handleVideoEnd}
          />
        ) : (
          <div className="dino-appear fade-in">
            <Player
              autoplay
              loop
              src={dinoMap[color]}
              className="dino-lottie"
            />
            <p className="hatch-text">
              새로운 공룡 <b>{name}</b>이(가) 태어났어요!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EggHatchModal;
