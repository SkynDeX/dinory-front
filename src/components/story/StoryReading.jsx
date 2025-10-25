import React, { useState, useEffect } from "react";
import "./StoryReading.css";
import { useParams, useNavigate } from "react-router-dom";
import { generateStory, saveChoice, completeStory } from "../../services/api/storyApi";
import SceneView from "../../components/story/SceneView";
import StoryCompletion from "../../components/story/StoryCompletion";

function StoryReading() {

    const {storyId} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [storyData, setStoryData] = useState(null);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [completionId, setCompletionId] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        initializeStory();
    }, [storyId]);

    const initializeStory = async () => {
        try {
            setLoading(true);
            setStartTime(Date.now());

            // localStorage 정보 가져오기
            const emotionData = JSON.parse(localStorage.getItem("selectedEmotion"));
            const interests = JSON.parse(localStorage.getItem("selectedInterests"));
            const childData = JSON.parse(localStorage.getItem("selectedChildForSession"));

            const requestData = {
                childId: childData?.id,
                childName: childData?.name,
                emotion: emotionData?.id,
                interests: interests
            };

            console.log("동화 생성 요청: ", requestData);

            // AI 서버로 동화 생성 요청
            const response = await generateStory(storyId, requestData);

            console.log("동화 생성 완료: ", response);

            setStoryData(response);
            setCompletionId(response.completionId);
            setCurrentSceneIndex(0);
            setLoading(false);
        } catch (error) {
            console.error("동화 생성 실패: ", error);
            alert("동화를 불러오는데 실패!");
            navigate(-1);
        }
    };

    const handleChoiceSelect  = async (choice) => {
        try {
            const currentScene = storyData.scenes[currentSceneIndex];

            // 선택지 저장
            const choiceData = {
                sceneNumber: currentScene.sceneNumber,
                choiceId: choice.choiceId,
                abilityType: choice.abilityType,
                abilityPoints: choice.abilityPoints
            };

            console.log("선택지 저장: ", choiceData);

            await saveChoice(completionId, choiceData);

            //  다음 씬 이동
            if(currentSceneIndex < storyData.scenes.length -1) {
                setCurrentSceneIndex(currentSceneIndex + 1);
            } else {
                //  마지막이면 완료처리
                handleStoryComplete();
            }
        } catch(error) {
            console.error("선택지 저장 실패: ", error);
            alert("선택을 저장하는데 실패!");
        }
    };

    const handleStoryComplete = async () => {
        try {
            const endTime = Date.now();
            const totalTime = Math.floor((endTime - startTime) / 1000); // 초 단위

            console.log("동화 완료 처리:", { totalTime });

            await completeStory(completionId, { totalTime });

            setIsCompleted(true);
        } catch (error) {
            console.error("동화 완료 처리 실패:", error);
            alert("동화 완료 처리에 실패했습니다.");
        }
    };

    const handleGoHome = () => {
        navigate("/main");
    }

    if(loading) {
        return (
            <div className="story_reading_wrapper">
                <div className="loading">동화를 준비하는 중...</div>
            </div>
        )
    }

    if (isCompleted) {
        return (
            <StoryCompletion
                storyTitle={storyData.scenes[0]?.content}
                onGoHome={handleGoHome}
            />
        );
    }

    return (
        <div className="story_reading_wrapper">
            {storyData && storyData.scenes && (
                <SceneView
                    scene={storyData.scenes[currentSceneIndex]}
                    totalScenes={storyData.totalScenes}
                    onChoiceSelect={handleChoiceSelect}
                />
            )}
        </div>
    );
}

export default StoryReading;