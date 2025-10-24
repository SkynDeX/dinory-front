import React, { useState } from "react";
import Lottie from "lottie-react";
import "./DinoCharacter.css";
import dinoAnimation from "../../assets/dino.json";
import { useNavigate } from "react-router-dom";

function DinoCharacter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="dino-wrapper">
      {/* 공룡 본체 */}
      <div
        className={`dino-container ${isJumping ? "jump" : ""}`}
        onClick={handleClick}
      >
        <Lottie
          animationData={dinoAnimation}
          loop
          autoplay
          className="dino-lottie"
        />
      </div>

      {/* 클릭하면 메뉴 말풍선뜨게끔 */}
      {isOpen && (
        <div className="speech-bubble menu-bubble">
          <p className="menu-title">뭐 할까?</p>
          <button onClick={() => navigate("/my-dinos")}>내 공룡 친구들</button>
          <buttion onClick={() => navigate("/child/registration")}>자녀 등록</buttion>
          <button disabled>추천좀요</button>
          <button disabled>화이팅</button>
        </div>
      )}

      {!isOpen && (
        <div className="speech-bubble idle-bubble bouncey">
          <p>나 눌러봐! </p>
        </div>
      )}
    </div>
  );
}

export default DinoCharacter;
