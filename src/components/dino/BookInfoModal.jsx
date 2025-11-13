import React, { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";
import "./BookInfoModal.css";
import dino from "../../assets/dino.json";
import { useAuth } from "../../context/AuthContext";
import { useChild } from "../../context/ChildContext";
import { useNavigate } from "react-router-dom";


export default function BookInfoModal({ book, onClose }) {
  const containerRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(true); // 항상 말풍선 유지
  const [isShocked, setIsShocked] = useState(false); // 놀람 상태

  // [2025-11-12 김광현] 동화생성 관려 state 추가
  const {user} = useAuth();
  const navigate = useNavigate();
  const {selectedChild, selectedEmotion, selectedInterests} = useChild();

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

  // [2025-11-12 김광현] 동화 시작 핸들러
  const handleStartStory = () => {
    console.log("동화 시작 클릭:", {
      book,
      user,
      selectedChild,
      selectedEmotion,
      selectedInterests
    });

    // 로그인 체크
    if (!user) {
      console.log("로그인이 필요!");
      navigate("/login");
      onClose();
      return;
    }

    // 자녀 선택 체크
    if (!selectedChild) {
      console.log("자식 선택 필요!");
      navigate('/child/select');
      onClose();
      return;
    }
    
    // 감정 선택 체크
    if (!selectedEmotion) {
      console.log("감정 선택 필요!");
      navigate('/child/emotion');
      onClose();
      return;
    }
    
    // 관심사 선택 체크
    if (!selectedInterests || selectedInterests.length === 0) {
      console.log("관심사 선택 필요!");
      navigate('/child/interest');
      onClose();
      return;
    }

    // 모든 조건이 확인되면
    console.log("모든 조건이 확인되었습니다.");
    navigate(`/story/${book.storyId}`);
    onClose();
  };


  if (!book) return null;

  return (
    <div className="book-modal-overlay" onClick={onClose}>
      <div className="book-modal" onClick={(e) => e.stopPropagation()}>

        {/* 헤더 */}
        <div className="book-modal-header">
          <img src={book.image} alt={book.title} className="book-modal-img" />
        </div>

        {/* 본문 */}
        <div className="book-modal-info">
          <h2 className="book-modal-title">{book.title}</h2>
          <p className="book-modal-desc">{book.desc}</p>
          {/* 추가 정보 */}
          {book.themes && book.themes.length > 0 && (
            <div className="book-modal-themes">
              <span className="themes-label">주제:</span>
              {book.themes.map((theme, index) => (
                <span key={index} className="theme-tag">{theme}</span>
              ))}
            </div>
          )}

          {book.matchingScore && (
            <div className="book-modal-matching">
              <span className="matching-label">매칭도:</span>
              <span className="matching-score">{book.matchingScore}%</span>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="book-modal-footer">
          <button className="btn-start-story" onClick={handleStartStory}>
            동화 읽기
          </button>
          <button className="book-modal-close" onClick={onClose}>
            닫기
          </button>
        </div>

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
