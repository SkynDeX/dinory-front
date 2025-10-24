import React, { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";
import "./BookInfoModal.css";
import dino from "../../assets/dino.json";

export default function BookInfoModal({ book, onClose }) {
  const containerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(true); // 항상 말풍선 유지
  const [isShocked, setIsShocked] = useState(false); // 놀람 상태

  useEffect(() => {
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: dino,
    });
    anim.setSpeed(1.2);

    return () => anim.destroy();
  }, []);

  // 클릭 시 놀람 효과
  const handleDinoClick = () => {
    if (isShocked) return; // 중복 클릭 방지
    setIsShocked(true);
    setTimeout(() => setIsShocked(false), 1000); 
  };

  if (!book) return null;

  return (
    <div className="book-modal-overlay" onClick={onClose}>
      <div className="book-modal" onClick={(e) => e.stopPropagation()}>
        <img src={book.image} alt={book.title} className="book-modal-img" />
        <h2 className="book-modal-title">{book.title}</h2>
        <p className="book-modal-desc">{book.desc}</p>

        <button className="book-modal-close" onClick={onClose}>
          닫기
        </button>

        {/* 🦕 공룡 */}
        <div
          className={`modal-dino-wrapper ${isShocked ? "shocked" : ""}`}
          onClick={handleDinoClick}
        >
          <div ref={containerRef} style={{ width: 160, height: 160 }} />
          <div className="modal-speech-bubble">
            {isShocked ? "히잇! 간지러워~ " : "이 책으로 읽어볼까?"}
          </div>
        </div>
      </div>
    </div>
  );
}
