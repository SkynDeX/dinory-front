import React, { useState } from "react";
import "./InterestSelection.css";
import { useNavigate } from "react-router-dom";
import { useChild } from "../../context/ChildContext";
import DinoCharacter from "../dino/DinoCharacter";

import dinosaur from "../../assets/interests/dinosaur.png";
import animal from "../../assets/interests/lion.png";
import vehicle from "../../assets/interests/car.png";
import space from "../../assets/interests/space.png";
import ocean from "../../assets/interests/waves.png";
import fairy from "../../assets/interests/fairy.png";
import friend from "../../assets/interests/friends.png";
import robot from "../../assets/interests/robot.png";

// 아이가 오늘의 관심사를 선택하는 랜딩 페이지
function InterestSelection() {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const navigate = useNavigate();
    const { setSelectedInterests: setContextInterests } = useChild();

  const interests = [
    { id: "dinosaur", 
      img: dinosaur, 
      label: "공룡", 
      color: "#2fa36b" },

    { id: "animal", 
      img: animal, 
      label: "동물", 
      color: "#ffd166" },

    { id: "vehicle", 
      img: vehicle, 
      label: "탈것", 
      color: "#ff6b6b" },

    { id: "space", 
      img: space, 
      label: "우주", 
      color: "#87ceeb" },

    { id: "ocean", 
      img: ocean, 
      label: "바다", 
      color: "#4a90e2" },

    { id: "fairy", 
      img: fairy, 
      label: "요정", 
      color: "#ff9b7a" },

    { id: "friend", 
      img: friend, 
      label: "친구", 
      color: "#ffb6c1" },

    { id: "robot", 
      img: robot, 
      label: "로봇", 
      color: "#c0c0c0" },
  ];

    // 다중 선택 핸들러
    const handleSelectInterest = (interest) => {
        setSelectedInterests((prev) => {
        // 이미 선택되어 있으면 제거
        if (prev.find(item => item.id === interest.id)) {
            return prev.filter(item => item.id !== interest.id);
        }
        // 없으면 추가
        return [...prev, interest];
        });
    };

    // 다음 버튼 클릭
    const handleNext = () => {
        if (selectedInterests.length === 0) {
            alert("관심사를 최소 1개 이상 선택해주세요!");
            return;
        }

        // Context에 저장 (label 배열로)
        const interestLabels = selectedInterests.map(interest => interest.label);
        setContextInterests(interestLabels);

        // [2025-11-12 김광현] 메인 페이지로 이동하여 추천 동화 캐러셀 표시
        // [2025-11-14 김광현] main -> /story/list
        navigate("/story/list");
    }

    // 선택된 관심사인지 확인
    const isSelected = (interestId) => {
        return selectedInterests.some(item => item.id === interestId);
    };

    return(
        <div className="interest_selection_wrapper">
            <div className="interest_header">
                <h2>어떤 이야기를 듣고 싶어?</h2>
                <p>좋아하는 주제를 골라봐! (여러 개 선택 가능)</p>
            </div>


            <div className="interest_grid">
              {interests.map((interest) => (
                <div
                 key={interest.id}
                 className={`interest_card${
                    isSelected(interest.id) ? " interest_card_active" : ""
                }`}
                onClick={() => handleSelectInterest(interest)}
                style={{
                  borderColor: isSelected(interest.id)
                    ? interest.color
                    : "#e0e0e0",
                }}
               >
                <img
                  src={interest.img}
                  alt={interest.label}
                  className="interest_img"
                />
                <p className="interest_label">{interest.label}</p>

                {isSelected(interest.id) && (
                  <div className="selected_check">✓</div>
                )}
             </div>
            ))}
           </div>
           
                {/* 선택된 관심사 표시 */}
                {selectedInterests.length > 0 && (
                    <div className="interest_selected">
                        <p>
                            와! 좋은 걸 골랐네! 이제 멋진 이야기가 시작될 거야!
                        </p>
                    </div>
                )}

                {/* 다음 버튼 */}
                <button 
                    className="next_btn"
                    onClick={handleNext}
                    disabled={selectedInterests.length === 0}
                >
                    다음 ({selectedInterests.length}개 선택)
                </button>

                <DinoCharacter />
        </div>
    );
}

export default InterestSelection;