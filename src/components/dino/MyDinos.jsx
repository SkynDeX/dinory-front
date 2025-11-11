import React, { useContext, useState } from "react";
import { RewardContext } from "../../context/RewardContext";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import "./MyDinos.css";

import redTRex from "../../assets/lottie/red-t-rex.json";
import shortDiplodocus from "../../assets/lottie/short-diplodocus.json";
import pteranodon from "../../assets/lottie/pteranodon.json";
import triceratops from "../../assets/lottie/triceratops.json";
import ankylosaurus from "../../assets/lottie/ankylosaurus.json";
import parasaurolophus from "../../assets/lottie/parasaurolophus.json";
import stegosaurus from "../../assets/lottie/stegosaurus.json";
import spinosaurus from "../../assets/lottie/spinosaurus.json";
import trex from "../../assets/lottie/t-rex.json";
import pachycephalosaurus from "../../assets/lottie/pachycephalosaurus.json";

// 🦕 Lottie 매핑
const dinoMap = {
  red: redTRex,
  diplo: shortDiplodocus,
  ptera: pteranodon,
  trice: triceratops,
  ankylosaurus,
  parasaurolophus,
  stegosaurus,
  spinosaurus,
  "t-rex": trex,
  pachycephalosaurus,
};

// 🎨 테마 리스트
const themes = ["forest", "desert", "snow"];

function MyDinos() {
  const { dinos } = useContext(RewardContext);
  const [theme, setTheme] = useState(localStorage.getItem("dinoTheme") || "forest");
  const [positions, setPositions] = useState(
    JSON.parse(localStorage.getItem("dinoPositions")) || {}
  );

  // 🎯 테마 변경
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("dinoTheme", newTheme);
  };

  // 💾 위치 저장 (drag 끝났을 때)
  const handleDragEnd = (event, info, name) => {
    setPositions((prev) => {
      const updated = { ...prev, [name]: { x: info.point.x, y: info.point.y } };
      localStorage.setItem("dinoPositions", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className={`mydinos-wrapper theme-${theme}`}>
      <h1 className="mydinos-title">내 공룡 마을</h1>

      {/* 🌿 테마 선택 */}
      <div className="theme-selector">
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => changeTheme(t)}
            className={theme === t ? "active" : ""}
          >
            {t === "forest" ? "🌲 숲" : t === "desert" ? "🏜 사막" : "❄ 눈밭"}
          </button>
        ))}
      </div>

      {/* 공룡 마을 영역 */}
      <div className="dino-room">
        {dinos.length === 0 ? (
          <p className="empty-text">아직 태어난 공룡이 없어요...</p>
        ) : (
          dinos.map((dino, i) => (
            <motion.div
              key={i}
              className="dino-draggable"
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => handleDragEnd(e, info, dino.name)}
              initial={positions[dino.name] || { x: 100 + i * 120, y: 200 }}
              whileTap={{ scale: 1.1 }}
            >
              <Player autoplay loop src={dinoMap[dino.colorType]} className="dino-lottie" />
              <div className="dino-name">{dino.name}</div>
            </motion.div>
          ))
        )}
      </div>

      <button
        className="home-btn"
        onClick={() => (window.location.href = "/main")}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default MyDinos;
