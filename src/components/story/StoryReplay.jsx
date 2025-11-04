import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCompletedStory } from "../../services/api/storyApi";
import '../../components/story/StoryReplay.css'

function StoryReplay() {

    const {completionId} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [storyData, setStoryData] = useState(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [error, setError] = useState(null);

    useEffect(()=> {
        const fetchStory = async () => {
             try {
                setLoading(true);
                console.log("다시보기 동화 조회: ", completionId);
                
                const data = await getCompletedStory(completionId);
                console.log("동화 데이터: ", data);

                setStoryData(data);
             } catch (error) {
                console.error("동화 조회 실패: ", error);
                setError("동화를 불러올 수 없습니다.");
             } finally {
                setLoading(false);
             }
        }

        if(completionId) {
            fetchStory();
        }
    }, [completionId]);

    const goToNextScene = () => {
        if(currentSceneIndex < storyData.scenes.length -1) {
            setCurrentSceneIndex(currentSceneIndex + 1);
        }
    };

    const goToPrevScene = () => {
        if (currentSceneIndex > 0) {
            setCurrentSceneIndex(currentSceneIndex - 1);
        }
    };

    const goToHome = () => {
        navigate('/parent/dashboard');
    };

    if (loading) {
        return (
            <div className="story_replay_wrapper">
                <div className="loading_state">동화를 불러오는 중...</div>
            </div>
        );
    }

    if (error || !storyData) {
        return (
            <div className="story_replay_wrapper">
                <div className="error_state">
                    <h3>오류</h3>
                    <p>{error || "동화를 찾을 수 없습니다."}</p>
                    <button onClick={goToHome}>홈으로 돌아가기</button>
                </div>
            </div>
        );
    }

    const currentScene = storyData.scenes[currentSceneIndex];

    return(
        <div className="story_replay_wrapper">
            {/* 헤더 */}
            <div className="replay_header">
                <button className="back_button" onClick={goToHome}>
                 ← 목록으로
                </button>
                <h1  className="story_title">{storyData.storyTitle}</h1>
                <div className="scene_counter">
                    {currentSceneIndex + 1} / {storyData.scenes.length}
                </div>
            </div>

            {/* 동화 정보 */}
            <div className="story_info">
                <span className="emotino_badge">{storyData.emotion}</span>
                {storyData.interests && storyData.interests.length > 0 && (
                    <div className="interests_tags">
                        {storyData.interests.map((interest, idx) => (
                            <span key={idx} className="interest_tag">#{interest}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* 현재 씬 표시 */}
            <div className="scene_container">
                {currentScene.imageUrl && (
                    <div className="scene_image">
                        <img src={currentScene.imageUrl} alt={`씬 ${currentScene.sceneNumber}`} />
                    </div>
                )}

                <div className="scene_content">
                    <p>{currentScene.content}</p>
                </div>

                {/* 선택지 표시(읽기 전용) */}
                {currentScene.choices && currentScene.choices.length > 0 && (
                    <div className="choices_container">
                        <h3>선택지</h3>
                        <div className="choices_list">
                            {currentScene.choices.map((choice, idx) => (
                                <div 
                                    key={idx} 
                                    className={`choice_item ${choice.text === currentScene.selectedChoiceText ? 'selected' : ''}`}
                                >
                                    <div className="choice_text">{choice.text}</div>
                                    <div className="choice_ability">
                                        {choice.abilityType} +{choice.abilityPoints}
                                    </div>
                                    {choice.text === currentScene.selectedChoiceText && (
                                        <div className="selected_badge">✓ 선택함</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 네비게이션 버튼 */}
            <div className="replay_navigation">
                <button 
                    className="nav_button prev"
                    onClick={goToPrevScene}
                    disabled={currentSceneIndex === 0}
                >
                    이전 장면
                </button>

                <button 
                    className="nav_button next"
                    onClick={goToNextScene}
                    disabled={currentSceneIndex === storyData.scenes.length - 1}
                >
                    다음 장면
                </button>
            </div>

            {/* 마지막 씬일 때 홈 버튼 */}
            {currentSceneIndex === storyData.scenes.length - 1 && (
                <div className="replay_footer">
                    <button className="home_button" onClick={goToHome}>
                        홈으로 돌아가기
                    </button>
                </div>
            )}
        </div>
    );

}

export default StoryReplay;