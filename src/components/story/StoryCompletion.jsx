import React, { useEffect, useState } from "react";
import "./StoryCompletion.css";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../../services/api/chatApi";
import { getStoryCompletionSummary } from "../../services/api/storyApi";


function StoryCompletion({ storyTitle, completionId, onGoHome }) {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getStoryCompletionSummary(completionId);
                console.log("동화 완료 요약:", data);
                setSummary(data);
            } catch (error) {
                console.error("요약 데이터 조회 실패 : ", error);
            }
        };

        if(completionId) {
            fetchSummary();
        }
    }, [completionId]);

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

                {/* 능력치 점수를 표시하기 */}
                {summary && (
                    <div className="ability_summary">
                        <h3 className="ability_summary_title">
                            <span className="title_icon">🌟</span>
                            획득한 능력치
                            <span className="title_icon">🌟</span>
                        </h3>
                        <div className="ability_scores">
                            {/* 용기 */}
                            <div className={`ability_item courage ${summary.totalCourage === 0 ? 'zero' : ''}`}>
                                <span className="ability_icon">💪</span>
                                <span className="ability_name">용기</span>
                                <span className="ability_value">+{summary.totalCourage || 0}</span>
                                <div className="ability_bar">
                                    <div 
                                        className="ability_bar_fill" 
                                        style={{width: `${Math.min((summary.totalCourage || 0) * 2, 100)}%`}}
                                    ></div>
                                </div>
                            </div>

                            {/* 공감 */}
                            <div className={`ability_item empathy ${summary.totalEmpathy === 0 ? 'zero' : ''}`}>
                                <span className="ability_icon">💖</span>
                                <span className="ability_name">공감</span>
                                <span className="ability_value">+{summary.totalEmpathy || 0}</span>
                                <div className="ability_bar">
                                    <div 
                                        className="ability_bar_fill" 
                                        style={{width: `${Math.min((summary.totalEmpathy || 0) * 2, 100)}%`}}
                                    ></div>
                                </div>
                            </div>

                            {/* 창의성 */}
                            <div className={`ability_item creativity ${summary.totalCreativity === 0 ? 'zero' : ''}`}>
                                <span className="ability_icon">🎨</span>
                                <span className="ability_name">창의성</span>
                                <span className="ability_value">+{summary.totalCreativity || 0}</span>
                                <div className="ability_bar">
                                    <div 
                                        className="ability_bar_fill" 
                                        style={{width: `${Math.min((summary.totalCreativity || 0) * 2, 100)}%`}}
                                    ></div>
                                </div>
                            </div>

                            {/* 책임감 */}
                            <div className={`ability_item responsibility ${summary.totalResponsibility === 0 ? 'zero' : ''}`}>
                                <span className="ability_icon">⭐</span>
                                <span className="ability_name">책임감</span>
                                <span className="ability_value">+{summary.totalResponsibility || 0}</span>
                                <div className="ability_bar">
                                    <div 
                                        className="ability_bar_fill" 
                                        style={{width: `${Math.min((summary.totalResponsibility || 0) * 2, 100)}%`}}
                                    ></div>
                                </div>
                            </div>

                            {/* 우정 */}
                            <div className={`ability_item friendship ${summary.totalFriendship === 0 ? 'zero' : ''}`}>
                                <span className="ability_icon">🤝</span>
                                <span className="ability_name">우정</span>
                                <span className="ability_value">+{summary.totalFriendship || 0}</span>
                                <div className="ability_bar">
                                    <div 
                                        className="ability_bar_fill" 
                                        style={{width: `${Math.min((summary.totalFriendship || 0) * 2, 100)}%`}}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="completion_buttons">
                    <button 
                        className="chat_button primary"
                        onClick={handleStartChat}
                        disabled={loading}
                    >
                        <span className="button_icon">💬</span>
                        {loading ? "준비중..." : "디노와 대화하기"}
                        <span className="button_arrow">→</span>
                    </button>

                    <button 
                        className="home_button secondary" 
                        onClick={onGoHome}
                    >
                        <span className="button_icon">🏠</span>
                        홈으로 돌아가기
                    </button>
                </div>

            </div>
        </div>
    );
}

export default StoryCompletion;