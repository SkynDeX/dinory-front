import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChild } from "../../context/ChildContext";
import LoadingScreen from "../common/LoadingScreen";
import DinoCharacter from "../dino/DinoCharacter";
import "./ChildSelectPage.css";

import bkid from "../../assets/icons/bkid.png";
import gkid from "../../assets/icons/gkid.png";

function ChildSelectPage() {
  const navigate = useNavigate();
  const { childrenList, loading, setSelectedChild, fetchChildren } = useChild();

  // 페이지 진입 시 자녀 목록 다시 불러오기
  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSelectChild = (child) => {
    // Context에 선택된 자녀 저장
    setSelectedChild(child);
    navigate("/child/emotion");
  };

  // 나이 계산
  const calculateAge = (birthDate) => {
    if (!birthDate) return "?";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // 자녀가 없는 경우 등록 페이지로 유도
  if (childrenList.length === 0) {
    return (
      <div className="child_select_page">
        <div className="select_header">
          <h2>등록된 자녀가 없어요</h2>
          <p>먼저 자녀를 등록해주세요!</p>
        </div>
        <button
          className="register_child_btn"
          onClick={() => navigate("/child/registration")}
        >
          자녀 등록하러 가기
        </button>
        <DinoCharacter />
      </div>
    );
  }

  return (
    <div className="child_select_page">
      <div className="select_header">
        <h2>오늘은 누가 동화를 만들어볼까?</h2>
        <p>동화를 만들고 싶은 친구를 선택해줘!</p>
      </div>

      <div className="child_card_grid">
        {childrenList.map((child) => {
          const avatarSrc =
            child.avatar && child.avatar.startsWith("http")
              ? child.avatar
              : child.gender === "male"
              ? bkid
              : gkid;

          return (
            <div
              key={child.id}
              className="child_card"
              onClick={() => handleSelectChild(child)}
            >
              <div className="child_avatar_large">
                <img
                  src={avatarSrc}
                  alt="child avatar"
                  className="child_avatar_img"
                />
              </div>
              <h3>{child.name}</h3>
              <p className="child_card_age">{calculateAge(child.birthDate)}세</p>
            </div>
          );
        })}
      </div>

      <DinoCharacter />
    </div>
  );
}

export default ChildSelectPage;
