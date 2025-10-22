import React, { createContext, useState, useEffect } from "react";
import EggHatchModal from "../components/EggHatchModal";

export const RewardContext = createContext();

export const RewardProvider = ({ children }) => {
  const [stars, setStars] = useState(0);
  const [eggs, setEggs] = useState(0);
  const [dinos, setDinos] = useState([]); // 내가 가진 공룡 목록

  // 현재 부화 상태
  const [isHatching, setIsHatching] = useState(false);
  const [currentHatch, setCurrentHatch] = useState(null);

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
  const getRandomDino = () => {
    const dinoList = [
        { name: "티라노", colorType: "red" },
        { name: "디플로", colorType: "diplo" },
        { name: "프테라", colorType: "ptera" },
        { name: "트리케", colorType: "trice" },
    ];
    
    const random = Math.floor(Math.random() * dinoList.length);
    return dinoList[random];
  };

  // 부화 로직
  const hatchEgg = () => {
    const newDino = getRandomDino();
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
