import React, { useState } from "react";
import "./EmotionCheckIn.css";
import { useNavigate } from "react-router-dom";
import DinoCharacter from "../dino/DinoCharacter";

// 아이가 오늘의 감정 선택하는 랜딩 페이지
function EmotionCheckIn() {
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const navigate = useNavigate();

    const emotions = [
        {id: "happy", emoji: "😊", label: "기뻐요", color: "#ffd166"},
        {id: "sad", emoji: "😢", label: "슬퍼요", color: "#87ceeb"},
        {id: "angry", emoji: "😠", label: "화가 나요", color: "#ff9b7a"},
        {id: "worried", emoji: "😰", label: "걱정돼요", color: "#b8b8ff"},
        {id: "excited", emoji: "🤩", label: "신나요", color: "#2fa36b"},
        {id: "sleepy", emoji: "😴", label: "졸려요", color: "#c8c8c8"}
    ];

    const handleSelectEmotion = (emotion) => {
        setSelectedEmotion(emotion);

        // 선택된 감정 저장
        sessionStorage.setItem("selectedEmotion", JSON.stringify(emotion));

        // 1초 후 관심사 선택 페이지로 이동
        setTimeout(() => {
            navigate("/child/interest");
        }, 1000);
    };

    return(
        <div className="emotion_checkin_wrapper">
            <div className="emotion_header">
                <h2>지금 기분이 어때?</h2>
                <p>오늘의 기분을 선택해줘!</p>
            </div>

            <div className="emotion_grid">
                {emotions.map((emotion) => (
                    <div
                        key={emotion.id}
                        className={`emotion_card${selectedEmotion?.id === emotion.id ? "_active" : ""}`}
                        onClick={() => handleSelectEmotion(emotion)}
                        style={{
                            borderColor: selectedEmotion?.id === emotion.id ? emotion.color : "#e0e0e0",
                        }}
                    >
                        <span className="emotion_emoji">{emotion.emoji}</span>
                        <p className="emotion_label">{emotion.label}</p>
                    </div>
                ))}
            </div>
            
            {selectedEmotion && (
                <div className="emotion_selected">
                    <p>
                        오늘은 <strong>{selectedEmotion.label}</strong> 기분이구나!
                    </p>
                </div>
            )}

            <DinoCharacter />
        </div>
    );
}

export default EmotionCheckIn;