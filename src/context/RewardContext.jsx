import React, { createContext, useState } from "react";
import EggHatchModal from "../components/dino/EggHatchModal";

export const RewardContext = createContext();

export const RewardProvider = ({ children }) => {
  const [stars, setStars] = useState(0);
  const [eggs, setEggs] = useState(0);
  const [dinos, setDinos] = useState([]); // 내가 가진 공룡 목록

  // 현재 부화 상태
  const [isHatching, setIsHatching] = useState(false);
  const [currentHatch, setCurrentHatch] = useState(null);

  // 전체 공룡 리스트
  const dinoList = [
    { name: "벨로시랩터", colorType: "red" },
    { name: "디플로쿠스", colorType: "diplo" },
    { name: "프테라노돈", colorType: "ptera" },
    { name: "트리케라톱스", colorType: "trice" },
    { name: "안킬로사우루스", colorType: "ankylosaurus" },
    { name: "파라사우롤로푸스", colorType: "parasaurolophus" },
    { name: "스테고사우루스", colorType: "stegosaurus" },
    { name: "스피노사우루스", colorType: "spinosaurus" },
    { name: "티라노사우루스", colorType: "t-rex" },
    { name: "파키케팔로사우루스", colorType: "pachycephalosaurus" },
  ];

  // 별 얻기
  const addStar = () => {
    setStars((prev) => {
      const newStars = prev + 1;
      if (newStars >= 5) {
        addEgg();
        return 0;
      }
      return newStars;
    });
  };

  // 알 얻기
  const addEgg = () => {
    setEggs((prev) => {
      const newEggs = prev + 1;
      // 알이 3개 이상이면 자동 부화
      if (newEggs >= 3) {
        hatchEgg();
        return 0;
      }
      return newEggs;
    });
  };

  // 랜덤 공룡 생성
  // 이미 얻은건 생성 안되게끔
  const getRandomDino = () => {
    // 아직 얻지 않은 공룡만 필터링해서
    const remaining = dinoList.filter(
      (d) => !dinos.some((owned) => owned.name === d.name)
    );

    // 다 모았을 경우에는 예외 처리
    if (remaining.length === 0) {
      alert("모든 공룡을 다 모았어요!");
      return null;
    }

    // 남은 공룡중에서 하나를 랜덤으로 나오게끔
    const random = Math.floor(Math.random() * remaining.length);
    return remaining[random];
  };

  // 부화 로직
  const hatchEgg = () => {
    const newDino = getRandomDino();
    if (!newDino) return; // null이면 중단

    setDinos((prev) => [...prev, newDino]);
    setCurrentHatch(newDino);
    setIsHatching(true);
  };

  // 부화 모달 닫기
  const handleCloseModal = () => {
    setIsHatching(false);
    setCurrentHatch(null);
  };

  return (
    <RewardContext.Provider
      value={{
        stars,
        eggs,
        dinos,
        addStar,
      }}
    >
      {children}

      {/* 부화 모달 */}
      {isHatching && currentHatch && (
        <EggHatchModal
          color={currentHatch.colorType}
          name={currentHatch.name}
          onClose={handleCloseModal}
        />
      )}
    </RewardContext.Provider>
  );
};
