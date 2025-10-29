import React, { useState } from "react";
import "./StoryCompletion.css";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../../services/api/chatApi";

function StoryCompletion({ storyTitle, completionId, onGoHome }) {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleStartChat = async () => {
        try {
            setLoading(true);
            console.log("동화 채팅 시작! : ", completionId);

            // 백엔드 API호출: 동화 채팅 세션 초기화
            const response = await chatApi.initChatSessionFromStory(completionId);

            console.log("채팅 세션 전달 : ", response);

            // 채팅 화면으로 이동
            navigate(`/chat/${response.sessionId}`, {
                state: {
                    fromStory: true,
                    completionId: completionId
                }
            });
            
        } catch (error) {
            console.error("채팅 시작 실패: ", error);
            alert("채팅을 시작 할 수 없습니다.");
            setLoading(false);
        }
    };


    return (
        <div className="story_completion_wrapper">
            <div className="completion_content">
                <div className="completion_icon">🎉</div>
                <h2>이야기를 모두 완성했어요!</h2>
                <p className="completion_message">
                    정말 멋진 선택들을 했어요!<br />
                    이제 디노와 이야기에 대해 대화해 볼까요?
                </p>

                <div className="completion_celebration">
                    <div className="star">⭐</div>
                    <div className="star">⭐</div>
                    <div className="star">⭐</div>
                </div>

                <div className="completion_buttons">
                    <button 
                        className="chat_button primary"
                        onClick={handleStartChat}
                        disabled={loading}>
                            {loading ? "준비중..." : "디노와 대화하기"}
                    </button>

                    <button className="home_button secondary" onClick={onGoHome}>
                        홈으로 돌아가기
                    </button>
                </div>

            </div>
        </div>
    );
}

export default StoryCompletion;