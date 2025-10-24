import React, { useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { createPortal } from "react-dom";
import "./EggHatchModal.css";
import { loadDinoLottie } from "../../context/loadDinoLottie";
import eggVideo from "../../assets/egg.mp4";

function EggHatchModal({ color, name, onClose }) {
  const [showDino, setShowDino] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [lottieData, setLottieData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const mod = await loadDinoLottie(color);
        if (mounted) setLottieData(mod.default);
      } catch (err) {
        console.error("공룡 로티 로딩 실패:", err);
      }
    };
    load();
    return () => (mounted = false);
  }, [color]);

  const handleVideoEnd = () => setShowDino(true);

  useEffect(() => {
    if (!showDino) return;
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const closeTimer = setTimeout(onClose, 3700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [showDino, onClose]);

  if (!lottieData) return null;

  return createPortal(
    <div className={`hatch-overlay ${fadeOut ? "fade-out" : ""}`}>
      <div className="hatch-content">
        {!showDino ? (
          <video
            src={eggVideo}
            autoPlay
            playsInline
            muted={true}
            className="hatch-video"
            onEnded={handleVideoEnd}
          />
        ) : (
          <div className="dino-appear fade-in">
            <Player autoplay loop={false} src={lottieData} className="dino-lottie" />
            <p className="hatch-text">
              새로운 공룡 <b>{name}</b>이(가) 태어났어요!
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default React.memo(EggHatchModal);
