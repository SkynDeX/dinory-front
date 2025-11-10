import React, { useState, useEffect, useContext } from "react";
import "./StoryReading.css";
import { useParams, useNavigate } from "react-router-dom";
import { generateStory, getNextScene, completeStory, analyzeCustomChoice  } from "../../services/api/storyApi";
import SceneView from "../../components/story/SceneView";
import { useChild } from "../../context/ChildContext";
import NegativeModal from "./NegativeModal";
import { RewardContext } from "../../context/RewardContext";

import LoadingScreen from "../../components/common/LoadingScreen.jsx";

const MAX_SCENES = 8;

function StoryReading() {
    const {storyId} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingNextScene, setLoadingNextScene] = useState(false);
    const [currentScene, setCurrentScene] = useState(null);
    const [currentSceneNumber, setCurrentSceneNumber] = useState(0);
    const [completionId, setCompletionId] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [storyContext, setStoryContext] = useState("");
    const { selectedChild, selectedEmotion, selectedInterests } = useChild();
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });
    // [2025-11-07 김광현 추가] 보상관련
    const {addStar, stars, eggs} = useContext(RewardContext);
    const [showRewardPopup, setShowRewardPopup] = useState(false);
    const [earnedEgg, setEarnedEgg] = useState(false);  // 알 획득 여부


    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                setLoading(true);
                setStartTime(Date.now());

                const requestData = {
                    childId: selectedChild?.id,
                    childName: selectedChild?.name,
                    emotion: selectedEmotion?.label,    // [2025-10-30 김광현] id -> label로 변경
                    interests: selectedInterests
                };

                console.log("🔥 첫 번째 씬 생성 요청: ", requestData);

                const response = await generateStory(storyId, requestData);

                console.log("✅ 첫 번째 씬 생성 완료: ", response);

                // 컴포넌트가 아직 마운트되어 있을 때만 state 업데이트
                if (isMounted) {
                    setCompletionId(response.completionId);

                    // imageUrl을 scene 객체에 추가
                    const sceneWithImage = {
                        ...response.scene,
                        imageUrl: response.imageUrl
                    };

                    setCurrentScene(sceneWithImage);
                    setCurrentSceneNumber(response.scene.sceneNumber);
                    setStoryContext(response.scene.content);
                    setLoading(false);
                }

            } catch (error) {
                console.error("❌ 동화 생성 실패: ", error);

                if (isMounted) {
                    setLoading(false);

                    if (error.message && error.message.includes('토큰이 만료')) {
                        console.log("ℹ️ 토큰이 갱신되었습니다. 동화를 다시 선택해주세요.");
                        return;
                    }

                    alert("동화를 불러오는데 실패했습니다!");
                    navigate(-1);
                }
            }
        };

        init();

        return () => {
            isMounted = false;
            console.log('=== cleanup: isMounted = false ===');
        };
    }, [storyId]);

    const handleChoiceSelect = async (choice) => {
        try {
            console.log("🎯 선택됨:", choice);

            // 커스텀(글쓰기) 경우 먼저 분석함
            let finalChoice = choice;

            if(choice.isCustom) {
                console.log("커스텀 선택지 분석중: ", choice.choiceText);

                try {
                    // api 호출
                    const analysisResult = await analyzeCustomChoice(
                        completionId,
                        currentScene.sceneNumber,
                        choice.choiceText
                    );

                    console.log("분석 결과 : ", analysisResult);

                    // [2025-11-04] 부정적 표현 감지 시 경고 -> [2025-11-05 김광현] alert에서 모달로 변경
                    if (analysisResult.isNegative) {
                        setModalState({
                            isOpen: true,
                            title:'다시 생각해볼까요?',
                            message: analysisResult.feedback || "부정적인 말보다 긍정적인 말을 사용하면 어떨까요? 친구를 도와주거나 용기를 내는 선택을 해보세요!",
                            type: 'warning'
                        });
                        return;  // 다음 씬으로 넘어가지 않음
                    }

                    // 분석 결과로 chocie 재구성
                    finalChoice = {
                        choiceId: choice.choiceId,
                        choiceText: choice.choiceText,
                        abilityType: analysisResult.abilityType,
                        abilityPoints: analysisResult.abilityPoints
                    };

                    // 사용자에게 피드백 표시
                    if(analysisResult.feedback) {
                        console.log("피드백: ", analysisResult.feedback);
                    }

                } catch (error) {
                    console.error("선택지 분석 실패: ", error);
                    alert("선택지 분석에 실패했습니다.");
                    return;
                }
            }

            const choiceData = {
                sceneNumber: currentScene.sceneNumber,
                choiceId: finalChoice.choiceId ?? finalChoice.id,
                abilityType: finalChoice.abilityType,
                abilityPoints: finalChoice.abilityPoints ?? finalChoice.abilityScore ?? 0,
                choiceText: finalChoice.choiceText || finalChoice.label || ""
            };

            if (currentSceneNumber >= MAX_SCENES || currentScene.isEnding) {
                console.log("📚 동화 마지막 씬 - 완료 처리");
                await handleStoryComplete();
                return;
            }

            setLoadingNextScene(true);

            console.log("📡 다음 씬 요청 중...");
            const nextSceneResponse = await getNextScene(completionId, choiceData);

            console.log("✅ 다음 씬 받음:", nextSceneResponse);

            setStoryContext(prevContext =>
                prevContext + "\n\n" + nextSceneResponse.scene.content
            );

            // imageUrl을 scene 객체에 추가
            const sceneWithImage = {
                ...nextSceneResponse.scene,
                imageUrl: nextSceneResponse.imageUrl
            };

            setCurrentScene(sceneWithImage);
            setCurrentSceneNumber(nextSceneResponse.scene.sceneNumber);
            setLoadingNextScene(false);

            if (nextSceneResponse.isEnding || nextSceneResponse.scene.sceneNumber >= MAX_SCENES) {
                console.log("🏁 마지막 씬 도달");
            }

        } catch(error) {
            console.error("❌ 다음 씬 요청 실패: ", error);
            alert("다음 장면을 불러오는데 실패했습니다!");
            setLoadingNextScene(false);
        }
    };

    const handleStoryComplete = async () => {
        try {
            const endTime = Date.now();
            const totalTime = Math.floor((endTime - startTime) / 1000);

            console.log("🎉 동화 완료 처리:", { totalTime });

            await completeStory(completionId, { totalTime });

            // [2025-11-07 김광현] 별 추가 로직
            const previousStars = stars;
            console.log("별 1개 획득!!!");
            await addStar();

            // 별 5개에서 0개로 바뀌었으면 알을 얻음
            if(previousStars === 4) {
                setEarnedEgg(true);
            }


            // 보상 팝업 표시(3초 후 사라짐)
            setShowRewardPopup(true);

            setTimeout(() => {
                setShowRewardPopup(false);
                // setIsCompleted(true);
                // [2025-11-05 김광현] 챗봇으로 바로 이동
                console.log("✅ 동화 완료! 챗봇 페이지로 이동:", `/chat/story/${completionId}`);
                navigate(`/chat/story/${completionId}`);              
            }, 3000);

        } catch (error) {
            console.error("❌ 동화 완료 처리 실패:", error);
            alert("동화 완료 처리에 실패했습니다.");
        }
    };


    if (loading) {

        return <LoadingScreen message="첫 번째 이야기를 만들고 있어요..." />;

    }

    if (loadingNextScene) {

        return (
            
            <LoadingScreen message="공룡 친구들이 다음 장면을 준비하고 있어요..." />

    );
  }

    return (
        <div className="story_reading_wrapper">

            <NegativeModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({...modalState, isOpen: false})}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
            />

            {currentScene && (
                <SceneView
                    scene={currentScene}
                    totalScenes={MAX_SCENES}
                    onChoiceSelect={handleChoiceSelect}
                />
            )}

            
            {/* 보상 팝업 - 개선 버전 */}
            {showRewardPopup && (
                <div className="reward-popup-overlay">
                    <div className="reward-popup-box">
                        <div className="popup-star-animation">⭐</div>
                        <h2>🎉 동화 완료!</h2>
                        <p className="popup-reward-text">별 1개를 획득했어요!</p>
                        
                        {earnedEgg ? (
                            // 알을 획득한 경우
                            <div className="popup-egg-reward">
                                <div className="popup-egg-animation">🥚</div>
                                <p className="popup-egg-text">축하해요! 공룡알도 얻었어요!</p>
                                <p className="popup-egg-hint">잠시 후 자동으로 부화합니다...</p>
                            </div>
                        ) : (
                            // 일반 별 획득
                            <div className="popup-progress">
                                <div className="popup-stars-display">
                                    {[...Array(5)].map((_, i) => (
                                        <span 
                                            key={i} 
                                            className={`popup-star ${i < stars ? 'filled' : 'empty'}`}
                                        >
                                            {i < stars ? '⭐' : '☆'}
                                        </span>
                                    ))}
                                </div>
                                <p>별 {stars}개 / 5개</p>
                                <p className="popup-hint">
                                    {stars === 4 ? '다음에 별을 모으면 공룡알을 얻어요!' : 
                                     `앞으로 ${5 - stars}개만 더 모으면 공룡알!`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StoryReading;