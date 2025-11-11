import React, { useContext, useState, useEffect } from "react";
import { RewardContext } from "../../context/RewardContext";
import { Player } from "@lottiefiles/react-lottie-player";
import { useNavigate } from "react-router-dom";
import "./MyDinos.css";
import { useChild } from "../../context/ChildContext";  // 추가
import axiosInstance from "../../services/api/axiosInstance";  // 추가

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

// 공룡 설명 모달용
const dinoDescriptions = {
  red: "빠르고 용감한 벨로시랩터! 불같은 성격이지만 친구를 잘 챙겨요.",
  diplo: "목이 길어 멀리 있는 나뭇잎도 먹을 수 있는 디플로쿠스예요.",
  ptera: "하늘을 나는 프테라노돈! 바람을 타고 세상을 구경하죠.",
  trice: "세 개의 뿔을 가진 트리케라톱스! 듬직한 친구랍니다.",
  ankylosaurus: "단단한 꼬리와 갑옷을 지닌 방패 공룡, 안킬로사우루스!",
  parasaurolophus: "머리 위의 관으로 소리를 내는 멋쟁이 파라사우롤로푸스!",
  stegosaurus: "등의 판이 멋진 스테고사우루스! 온화한 초식 공룡이에요.",
  spinosaurus: "거대한 등지느러미를 가진 물가의 사냥꾼 스피노사우루스!",
  "t-rex": "가장 강력한 공룡! 무시무시하지만 사실은 외로움을 타요.",
  pachycephalosaurus: "단단한 머리로 부딪히는 싸움꾼, 파키케팔로사우루스!",
};

function MyDinos() {
  const { dinos, eggs, hatchEgg, setDinos } = useContext(RewardContext);
  const { selectedChild } = useChild();  // 추가
  const [selectedDino, setSelectedDino] = useState(null);
  const navigate = useNavigate();

  // [2025-11-11 김광현] 수동 부활 추가
  const handleManualHatch = async () => {
    if (eggs <= 0) {
      alert("부활할 알이 없습니다.");
      return;
    }

    try {
      await hatchEgg();
    } catch (error) {
      console.error("수동 부화 실패:" , error);
      alert("부화에 실패하였습니다.");
    }
  }

  // [2025-11-11 김광현] 페이지 마운트 시 최신 공룡 목록 가져오기
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
  }, [selectedChild, setDinos]);  // selectedChild 변경 시마다 새로고침

  return (
    <div className="mydinos-wrapper">
      <h1 className="mydinos-title">내 공룡 친구들</h1>

      {/* [2025-11-11 김광현] 알 개수 및 부화 버튼 */}
      <div className="egg-section">
        <p className="egg-count">보유한 알 : {eggs}개</p>
        {eggs > 0 && (
          <button className="hatch-btn" onClick={handleManualHatch}>
            알 부화하기 🥚
          </button>
        )}
      </div>

      {dinos.length === 0 ? (
        <p className="empty-text">아직 태어난 공룡이 없어요...</p>
      ) : (
        <div className="dino-grid">
          {dinos.map((dino, i) => (
            <div
              key={i}
              className="dino-card"
              onClick={() => setSelectedDino(dino)}
            >
              <Player autoplay loop src={dinoMap[dino.colorType]} className="dino-lottie" />
              <div className="dino-name">{dino.name}</div>
            </div>
          ))}
        </div>
      )}

      <button className="home-btn" onClick={() => navigate("/main")}>
        홈으로 돌아가기
      </button>

      {selectedDino && (
        <div
          className="dino-modal-overlay"
          onClick={() => setSelectedDino(null)}
        >
          <div
            className="dino-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <Player
              autoplay
              loop
              src={dinoMap[selectedDino.colorType]}
              className="dino-modal-lottie"
            />
            <h2 className="modal-dino-name">{selectedDino.name}</h2>
            <p className="modal-dino-desc">
              {dinoDescriptions[selectedDino.colorType] ||
                "이 공룡에 대한 설명이 없어요."}
            </p>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedDino(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyDinos;
