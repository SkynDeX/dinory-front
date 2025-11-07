import React, { createContext, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import EggHatchModal from "../components/dino/EggHatchModal";
import { useChild } from "./ChildContext";

export const RewardContext = createContext();

axios.defaults.baseURL = "";

export const RewardProvider = ({ children }) => {
  const [stars, setStars] = useState(0);
  const [eggs, setEggs] = useState(0);
  const [dinos, setDinos] = useState([]);
  const [isHatching, setIsHatching] = useState(false);
  const [currentHatch, setCurrentHatch] = useState(null);
  const token = localStorage.getItem("accessToken");
  const {selectedChild} = useChild();

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

  /* 초기 리워드 데이터 로드 */
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {

        const childId = selectedChild?.id;
        if (!childId) {
          console.log("선택된 자녀가 없습니다!!");
          return;
        }

        const rewardRes = await axios.get(`/api/child/reward/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStars(rewardRes.data.stars);
        setEggs(rewardRes.data.eggs);

        const dinoRes = await axios.get(`/api/dino/child/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mappedDinos = (dinoRes.data || []).map((d) => ({
          name: d.name || d.dinoName || d.dino_name || "이름 없는 공룡",
          colorType: d.colorType || d.color_type || "red",
        }));
        setDinos(mappedDinos);
      } catch (err) {
        console.error("리워드 불러오기 실패:", err);
      }
    };
    fetchData();
  }, [token, selectedChild]);

  /* 별 추가 */
  const addStar = async () => {
    try {

      const childId = selectedChild?.id;
        if (!childId) {
          console.log("선택된 자녀가 없습니다!!");
          return;
        }

      const res = await axios.post(
        `/api/child/reward/${childId}/star`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newStars = res.data.stars;
      const newEggs = res.data.eggs;

      setStars(newStars);
      setEggs(newEggs);

      if (newStars === 0 && newEggs > eggs) {
        await hatchEgg();  
    }
    
    } catch (err) {
      console.error("별 추가 실패:", err);
    }
  };

  /* 알 생성 */
  const addEgg = async () => {
    try {

      const childId = selectedChild?.id;
        if (!childId) {
          console.log("선택된 자녀가 없습니다!!");
          return;
        }

      const res = await axios.post(
        `/api/child/reward/${childId}/egg`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newStars = res.data.stars ?? stars;
      const newEggs = res.data.eggs ?? eggs;
      setStars(newStars);
      setEggs(newEggs);
      if (newEggs >= 1) await hatchEgg();
    } catch (err) {
      console.error("알 추가 실패:", err);
    }
  };

  /* 부화 로직 (성능 개선 버전) */
  const hatchEgg = async () => {
    try {

      const childId = selectedChild?.id;
        if (!childId) {
          console.log("선택된 자녀가 없습니다!!");
          return;
        }
        
      const remaining = dinoList.filter(
        (d) => !dinos.some((owned) => owned.name === d.name)
      );
      if (remaining.length === 0) {
        alert("모든 공룡을 다 모았어요!");
        return;
      }
      const random = Math.floor(Math.random() * remaining.length);
      const newDino = remaining[random];

      const res = await axios.post(
         `/api/dino/child/${childId}/hatch`,
        null,
        {
          params: { name: newDino.name, colorType: newDino.colorType },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDinos((prev) => [...prev, res.data]);
      setTimeout(() => {
        setCurrentHatch(newDino);
        setIsHatching(true);
      }, 500); // 렌더 프레임 안정화
    } catch (err) {
      console.error("공룡 부화 실패:", err);
    }
  };

  /* 모달 닫기 */
  const handleCloseModal = () => {
    setIsHatching(false);
    setCurrentHatch(null);
  };

  return (
    <RewardContext.Provider
      value={{ stars, eggs, dinos, addStar, addEgg, isHatching, currentHatch }}
    >
      {children}

      {isHatching && currentHatch &&
        ReactDOM.createPortal(
          <EggHatchModal
            key={currentHatch.name}
            color={currentHatch.colorType}
            name={currentHatch.name}
            onClose={handleCloseModal}
          />,
          document.body
        )
      }
    </RewardContext.Provider>
  );
};
