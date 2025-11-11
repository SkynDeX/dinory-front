import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import dinoHappy from "../../assets/dino.json";
import "./DinoTutorial.css";

function DinoTutorial() {
  const [show, setShow] = useState(true);

  // 배경 클릭 시 닫기
  const handleOverlayClick = (e) => {
    // 내부 클릭은 무시
    if (e.target.classList.contains("tutorial-overlay")) {
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="tutorial-overlay" onClick={handleOverlayClick}>
      <div className="tutorial-box">
        {/* 닫기 버튼 */}
        <button className="tutorial-close" onClick={() => setShow(false)}>✕</button>

        <Lottie animationData={dinoHappy} loop autoplay className="tutorial-dino" />

        <div className="tutorial-bubble">
          <h3>안녕! 나는 디노야!</h3>
          <p>
            여기는 네가 키운 공룡들이 사는 마을이야.<br />
            <b>“꾸미기”</b> 버튼을 눌러서<br />
            나무🌳, 꽃🌸, 둥지🥚 같은 오브젝트를 배치해봐!
          </p>
        </div>
      </div>
    </div>
  );
}

export default DinoTutorial;
