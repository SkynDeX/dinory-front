import react, { useState } from "react";
import "./InterestSelection.css";
import { useNavigate } from "react-router-dom";
import DinoCharacter from "../dino/DinoCharacter";

// 아이가 오늘의 관심사를 선택하는 랜딩 페이지
function InterestSelection() {
    const [selectedInterests, setSelectedInterests] = useState([]);
    const navigate = useNavigate();

    const interests = [
        { id: "dinosaur", emoji: "🦕", label: "공룡", color: "#2fa36b" },
        { id: "animal", emoji: "🐶", label: "동물", color: "#ffd166" },
        { id: "vehicle", emoji: "🚗", label: "탈것", color: "#ff6b6b" },
        { id: "space", emoji: "🚀", label: "우주", color: "#87ceeb" },
        { id: "ocean", emoji: "🌊", label: "바다", color: "#4a90e2" },
        { id: "fairy", emoji: "🧚", label: "요정", color: "#ff9b7a" },
        { id: "friend", emoji: "👫", label: "친구", color: "#ffb6c1" },
        { id: "robot", emoji: "🤖", label: "로봇", color: "#c0c0c0" },
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

        // 선택된 관심사 배열로 저장 (id만 추출)
        const interestIds = selectedInterests.map(interest => interest.id);
        localStorage.setItem("selectedInterests", JSON.stringify(interestIds));

        // 아이 홈으로 이동
        navigate("/main");

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
                {interests.map((interest) =>(
                    <div
                        key={interest.id}
                        className={`interest_card${isSelected(interest.id) ? "_active" : ""}`}
                        onClick={() => handleSelectInterest(interest)}
                        style={{
                            borderColor: isSelected(interest.id) ? interest.color : "#e0e0e0",
                        }}    
                    >
                        <span className="interest_emoji">{interest.emoji}</span>
                        <p className="interest_label">{interest.label}</p>

                        {/* 선택 표시 */}
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