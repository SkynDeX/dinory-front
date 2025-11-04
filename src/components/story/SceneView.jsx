import React, { useEffect, useState } from "react";
import "./SceneView.css";
import ChoiceButton from "./ChoiceButton";
import ImageDisplay from "./ImageDisplay";
import axiosInstance from "../../services/api/axiosInstance";

function SceneView({ scene, totalScenes, onChoiceSelect }) {

    const [imageUrl, setImageUrl] = useState(scene.imageUrl);

    useEffect(() => {
        // scene 변경시 이미지 초기화
        setImageUrl(scene.imageUrl);
    }, [scene.sceneNumber]);

    // [2025-11-04 김광현] 동화생성 이미지 비동기
    useEffect(() => {
        // sceneId가 없거나 이미 imageUrl이 있으면 스킵
        if (!scene.sceneId || imageUrl) {
            return;
        }

        console.log(`씬 ${scene.sceneNumber} 이미지 폴링 시작...`);

        let attemptCount = 0;
        const maxAttempts = 15; 
        let isMounted = true;  // cleanup 체크용

        // 2초마다 이미지 확인
        const interval = setInterval(async () => {
            if (!isMounted) {
                clearInterval(interval);
                return;
            }

            attemptCount++;

            try {
                // axiosInstance 사용 (인증 토큰 자동 포함)
                const response = await axiosInstance.get(`/api/story/scene/${scene.sceneId}/image`);
                
                if (response.data && response.data.imageUrl) {
                    console.log(`씬 ${scene.sceneNumber} 이미지 로드 완료`);
                    setImageUrl(response.data.imageUrl);
                    clearInterval(interval);
                } else {
                    console.log(`이미지 아직 생성 중... (${attemptCount}/${maxAttempts})`);
                }
            } catch (error) {
                console.log(`이미지 로딩 중... (${attemptCount}/${maxAttempts})`, error.message);
            }

            // 최대 시도 횟수 초과 시 포기
            if (attemptCount >= maxAttempts) {
                console.log(`씬 ${scene.sceneNumber} 이미지 로딩 타임아웃`);
                clearInterval(interval);
            }
        }, 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [scene.sceneId, scene.sceneNumber]); 


    return (
        <div className="scene_view_wrapper">
            {/* 진행 상황 표시 */}
            <div className="scene_progress">
                <span>Scene {scene.sceneNumber} / {totalScenes}</span>
                <div className="progress_bar">
                    <div className="progress_fill"
                        style={{ width: `${(scene.sceneNumber / totalScenes) * 100}%` }}>
                    </div>
                </div>
            </div>

            {/* 이미지 영역 */}
            <ImageDisplay imagePrompt={scene.imagePrompt} imageUrl={imageUrl} />  {/* scene.imageUrl → imageUrl */}

            {/* 스토리 내용 */}
            <div className="scene_content">
                <p>{scene.content}</p>
            </div>

            {/* 선택지 버튼들 */}
            <div className="choices_container">
                <p className="choices_title">어떻게 할까?</p>
                <div className="choices_grid">
                    {scene.choices && scene.choices.map((choice) => (
                        <ChoiceButton
                            key={choice.choiceId}
                            choice={choice}
                            onSelect={onChoiceSelect}
                        />
                    ))}
                </div>

                {/* 입력창 */}
                <div className="custom_choice_section">
                    <p className="custom_choice_title">나만의 선택을 입력해보세요!</p>
                    <form
                        className="custom_choice_form" 
                        onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.target.elements.customText;
                        if (input.value.trim()) {
                            onChoiceSelect({
                                isCustom: true,
                                choiceText: input.value.trim(),
                                choiceId: `custom_${Date.now()}`
                            });
                            input.value = '';
                        }
                    }}>
                        <input
                            type="text"
                            name="customText"
                            placeholder="예: 친구에게 도움을 요청한다."
                            className="custom_choice_input"
                            maxLength={100}
                        ></input>
                        <button type="submit" className="custom_choice_submit">
                            선택하기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SceneView;