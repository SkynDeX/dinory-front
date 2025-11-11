import React, { useContext, useState, useEffect, useRef } from "react";
import { RewardContext } from "../../context/RewardContext";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./MyDinos.css";
import { useChild } from "../../context/ChildContext";
import axiosInstance from "../../services/api/axiosInstance";
import DinoTutorial from "../dino/DinoTutorial";

// 로티
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

// 배경
import forestBg from "../../assets/backgrounds/grass_line.png";
import desertBg from "../../assets/backgrounds/sand_line.png";
import snowBg from "../../assets/backgrounds/snow_line.png";

// 오브젝트
import tree from "../../assets/objects/tree.png";
import flower from "../../assets/objects/flower.png";
import stone from "../../assets/objects/stone.png";
import nest from "../../assets/objects/egg-nest.png";

// 공룡 로티 매핑
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

// 배경 테마
const themes = ["forest", "desert", "snow"];
const bgMap = { forest: forestBg, desert: desertBg, snow: snowBg };

function MyDinos() {
  const { dinos, eggs, hatchEgg, setDinos } = useContext(RewardContext);
  const { selectedChild } = useChild();
  const navigate = useNavigate();
  const roomRef = useRef(null);

  // 꾸미기 관련 상태
  const [theme, setTheme] = useState(localStorage.getItem("dinoTheme") || "forest");
  const [positions, setPositions] = useState(
    JSON.parse(localStorage.getItem("dinoPositions")) || {}
  );
  const [affection, setAffection] = useState(
    JSON.parse(localStorage.getItem("dinoAffection")) || {}
  );
  const [speech, setSpeech] = useState({});
  const [isDecorating, setIsDecorating] = useState(false);
  const [decorations, setDecorations] = useState(
    JSON.parse(localStorage.getItem("dinoDecorations")) || []
  );

  const decorOptions = [
    { name: "tree", src: tree },
    { name: "flower", src: flower },
    { name: "stone", src: stone },
    { name: "nest", src: nest },
  ];

  // 테마 변경
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("dinoTheme", newTheme);
  };

  // 공룡 드래그 후 위치 저장
  const handleDragEnd = (event, info, name) => {
    const room = roomRef.current;
    if (!room) return;
    const rect = room.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const y = info.point.y - rect.top;

    setPositions((prev) => {
      const updated = { ...prev, [name]: { x, y } };
      localStorage.setItem("dinoPositions", JSON.stringify(updated));
      return updated;
    });
  };

  // 오브젝트 드래그 후 위치 저장
  const handleDecorDragEnd = (e, info, idx) => {
    if (!isDecorating || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const y = info.point.y - rect.top;

    setDecorations((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, x, y } : d))
    );
  };

  // 오브젝트 삭제
  const deleteDecoration = (idx) => {
    setDecorations((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      localStorage.setItem("dinoDecorations", JSON.stringify(updated));
      return updated;
    });
  };

  // 클릭 시 반응
  const handleClickDino = (event, name) => {
    const clickX = event.clientX;
    const clickY = event.clientY;

    setAffection((prev) => {
      const next = { ...prev, [name]: Math.min((prev[name] || 0) + 10, 100) };
      localStorage.setItem("dinoAffection", JSON.stringify(next));

      const heartCount = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement("div");
        heart.className = "heart-float";
        heart.textContent = ["💖", "💞", "💓"][Math.floor(Math.random() * 3)];
        heart.style.left = `${clickX + (Math.random() * 60 - 30)}px`;
        heart.style.top = `${clickY + (Math.random() * 30 - 15)}px`;
        document.body.appendChild(heart);

        const moveX = Math.random() * 80 - 40;
        const moveY = Math.random() * -100 - 80;
        setTimeout(() => {
          heart.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.3)`;
          heart.style.opacity = 0;
        }, 50);
        setTimeout(() => heart.remove(), 1000 + Math.random() * 300);
      }

      if ((prev[name] || 0) + 10 >= 100 && !(speech[name] && speech[name].active)) {
        triggerCelebration(clickX, clickY, name);
      }

      return next;
    });
  };

  // 말풍선 이벤트
  const triggerCelebration = (x, y, name) => {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${x - 60}px`;
    sparkle.style.top = `${y - 60}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 1200);

    setSpeech((prev) => ({
      ...prev,
      [name]: { text: "너무 좋아! 💕", active: true },
    }));

    setTimeout(() => {
      setSpeech((prev) => ({ ...prev, [name]: { text: "", active: false } }));
    }, 2000);
  };

  // 꾸미기 저장
  const saveDecorations = () => {
    localStorage.setItem("dinoDecorations", JSON.stringify(decorations));
    setIsDecorating(false);
  };

  // 오브젝트 추가
  const addDecoration = (obj) => {
    setDecorations((prev) => [
      ...prev,
      { ...obj, x: 400, y: 400, size: "100px" },
    ]);
  };

  // 수동 부활
  const handleManualHatch = async () => {
    if (eggs <= 0) {
      alert("부활할 알이 없습니다.");
      return;
    }

    try {
      await hatchEgg();
    } catch (error) {
      console.error("수동 부화 실패:", error);
      alert("부화에 실패하였습니다.");
    }
  };

  // 페이지 마운트 시 공룡 목록
  useEffect(() => {
    const fetchDinos = async () => {
      try {
        const childId = selectedChild?.id;
        if (!childId) return;

        const dinoRes = await axiosInstance.get(`/api/dino/child/${childId}`);
        const mappedDinos = (dinoRes.data || []).map((d) => ({
          name: d.name || d.dinoName || d.dino_name || "이름 없는 공룡",
          colorType: d.colorType || d.color_type || "red",
        }));
        setDinos(mappedDinos);
      } catch (error) {
        console.error("공룡 목록 불러오기 실패:", error);
      }
    };

    fetchDinos();
  }, [selectedChild, setDinos]);

  return (
    <div className={`mydinos-wrapper theme-${theme}`}>
      <DinoTutorial onStartDecorate={() => setIsDecorating(true)} />

      <h1 className="mydinos-title">내 공룡 마을</h1>

      {/* 알 부화
      <div className="egg-section">
        <p className="egg-count">보유한 알 : {eggs}개</p>
        {eggs > 0 && (
          <button className="hatch-btn" onClick={handleManualHatch}>
            알 부화하기 🥚
          </button>
        )}
      </div> */}

      {/* 꾸미기 버튼 */}
      <div className="decorate-controls">
        {!isDecorating ? (
          <button onClick={() => setIsDecorating(true)} className="decorate-btn">
            꾸미기
          </button>
        ) : (
          <button onClick={saveDecorations} className="save-decorate-btn">
            저장
          </button>
        )}
      </div>

      {/* 테마 선택 */}
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

      {/* 공룡 영역 */}
      <div
        ref={roomRef}
        className="dino-room"
        style={{
          backgroundImage: `url(${bgMap[theme]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {decorations.map((item, idx) => (
          <motion.div
            key={idx}
            className="decor-wrapper"
            drag={isDecorating}
            dragMomentum={false}
            onDragEnd={(e, info) => handleDecorDragEnd(e, info, idx)}
            initial={{ x: item.x || 0, y: item.y || 0 }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 2,
              cursor: isDecorating ? "grab" : "default",
            }}
          >
            {isDecorating && (
              <button
                className="delete-btn"
                onClick={() => deleteDecoration(idx)}
              >
                ✖
              </button>
            )}
            <img
              src={item.src}
              alt={item.name}
              style={{
                width: item.size,
                userSelect: "none",
                pointerEvents: "auto",
              }}
              draggable={false}
            />
          </motion.div>
        ))}

        {/* 공룡 표시 */}
        {dinos.length === 0 ? (
          <p className="empty-text">아직 태어난 공룡이 없어요...</p>
        ) : (
          dinos.map((dino, i) => (
            <motion.div
              key={i}
              className="dino-draggable"
              drag
              dragMomentum={false}
              dragConstraints={{ top: 0, bottom: 600, left: 0, right: 1000 }}
              onDragEnd={(e, info) => handleDragEnd(e, info, dino.name)}
              onClick={(e) => handleClickDino(e, dino.name)}
              initial={positions[dino.name] || { x: 100 + i * 120, y: 200 }}
              whileTap={{ scale: 1.1 }}
              style={{ zIndex: 3 }}
            >
              {speech[dino.name]?.active && (
                <motion.div
                  className="speech-bubble"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {speech[dino.name].text}
                </motion.div>
              )}
              <Player autoplay loop src={dinoMap[dino.colorType]} className="dino-lottie" />
              <div className="dino-name">{dino.name}</div>
              <div className="affection-bar">
                <div
                  className="affection-fill"
                  style={{ width: `${Math.min(affection[dino.name] || 0, 100)}%` }}
                />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 오브젝트 선택 */}
      {isDecorating && (
        <div className="object-toolbar">
          {decorOptions.map((obj) => (
            <img
              key={obj.name}
              src={obj.src}
              alt={obj.name}
              className="decor-option"
              onClick={() => addDecoration(obj)}
            />
          ))}
        </div>
      )}

      <button
        className="home-btn"
        onClick={() => navigate("/main")}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default MyDinos;
