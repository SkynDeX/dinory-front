// src/components/dino/EggHatchModal.jsx
import React, { useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { createPortal } from "react-dom";
import "./EggHatchModal.css";
import { loadDinoLottie } from "../../context/loadDinoLottie";

// 부화 영상
import eggVideo from "../../assets/egg.mp4";

function EggHatchModal({ color, name, onClose }) {
  const [showDino, setShowDino] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [lottieData, setLottieData] = useState(null); 

  useEffect(() => {
    let mounted = true;
    loadDinoLottie(color).then((mod) => {
      if (mounted) setLottieData(mod.default);
    });
    return () => {
      mounted = false;
    };
  }, [color]);

  // 영상 끝나면 공룡 등장
  const handleVideoEnd = () => setShowDino(true);

  // 공룡이 등장하면 3초 후 자동 닫기 (fade-out)
  useEffect(() => {
    if (!showDino) return;
    const t1 = setTimeout(() => setFadeOut(true), 3000);
    const t2 = setTimeout(onClose, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showDino, onClose]);

  // 로티가 아직 로딩 중이면 보여주지 않음
  if (!lottieData) return null;

  // 포털로 렌더할 콘텐츠
  const portalContent = (
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
            <Player autoplay loop src={lottieData} className="dino-lottie" />
            <p className="hatch-text">
              새로운 공룡 <b>{name}</b>이(가) 태어났어요!
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
}

// 불필요 렌더 방지를 위해 memo 적용
export default React.memo(EggHatchModal);
