import React, { useState, useEffect } from "react";
import "./StoryReading.css";
import { useParams, useNavigate } from "react-router-dom";
import { generateStory, getNextScene, completeStory } from "../../services/api/storyApi";
import SceneView from "../../components/story/SceneView";
import StoryCompletion from "../../components/story/StoryCompletion";
import { useChild } from "../../context/ChildContext";

const MAX_SCENES = 8;

function StoryReading() {
    const {storyId} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingNextScene, setLoadingNextScene] = useState(false);
    const [currentScene, setCurrentScene] = useState(null);
    const [currentSceneNumber, setCurrentSceneNumber] = useState(0);
    const [completionId, setCompletionId] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [storyContext, setStoryContext] = useState("");
    const { selectedChild, selectedEmotion, selectedInterests } = useChild();

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                setLoading(true);
                setStartTime(Date.now());

                const requestData = {
                    childId: selectedChild?.id,
                    childName: selectedChild?.name,
                    emotion: selectedEmotion?.id,
                    interests: selectedInterests
                };

                console.log("🔥 첫 번째 씬 생성 요청: ", requestData);

                const response = await generateStory(storyId, requestData);

                console.log("✅ 첫 번째 씬 생성 완료: ", response);

                // 컴포넌트가 아직 마운트되어 있을 때만 state 업데이트
                if (isMounted) {
                    setCompletionId(response.completionId);
                    setCurrentScene(response.scene);
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

            const choiceData = {
                sceneNumber: currentScene.sceneNumber,
                choiceId: choice.choiceId ?? choice.id,
                abilityType: choice.abilityType,
                abilityPoints: choice.abilityPoints ?? choice.abilityScore ?? 0,
                choiceText: choice.choiceText || choice.label || ""
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

            setCurrentScene(nextSceneResponse.scene);
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

            setIsCompleted(true);
        } catch (error) {
            console.error("❌ 동화 완료 처리 실패:", error);
            alert("동화 완료 처리에 실패했습니다.");
        }
    };

    const handleGoHome = () => {
        navigate("/main");
    }

    if(loading) {
        return (
            <div className="story_reading_wrapper">
                <div className="loading">첫 번째 장면을 준비하는 중...</div>
            </div>
        )
    }

    if (loadingNextScene) {
        return (
            <div className="story_reading_wrapper">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>AI가 당신의 선택에 맞는</p>
                    <p>다음 장면을 만들고 있어요...</p>
                    <p className="loading-hint">(5-10초 소요)</p>
                </div>
            </div>
        )
    }

    if (isCompleted) {
        return (
            <StoryCompletion
                storyTitle={storyContext.substring(0, 50) + "..."}
                completionId={completionId}
                onGoHome={handleGoHome}
            />
        );
    }

    return (
        <div className="story_reading_wrapper">
            {currentScene && (
                <SceneView
                    scene={currentScene}
                    totalScenes={MAX_SCENES}
                    onChoiceSelect={handleChoiceSelect}
                />
            )}
        </div>
    );
}

export default StoryReading;