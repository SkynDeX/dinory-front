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
    // [2025-11-11 수정] 폴링 간격 및 타임아웃 증가 (이미지 생성 시간 고려)
    useEffect(() => {
        // sceneId가 없거나 이미 imageUrl이 있으면 스킵
        if (!scene.sceneId || imageUrl) {
            return;
        }

        console.log(`씬 ${scene.sceneNumber} 이미지 폴링 시작...`);

        let attemptCount = 0;
        const maxAttempts = 60;  // [2025-11-11] 20 → 60 증가 (AI 이미지 생성 시간 고려)
        let isMounted = true;  // cleanup 체크용

        // [2025-11-11] 500ms → 2000ms로 증가 (서버 부하 감소, 총 대기 시간 120초)
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
                    console.log(`✅ 씬 ${scene.sceneNumber} 이미지 로드 완료 (${attemptCount}번째 시도)`);
                    setImageUrl(response.data.imageUrl);
                    clearInterval(interval);
                } else {
                    console.log(`⏳ 이미지 생성 중... (${attemptCount}/${maxAttempts}) - 최대 ${Math.floor(maxAttempts * 2 / 60)}분 대기`);
                }
            } catch (error) {
                console.log(`⚠️ 이미지 로딩 중... (${attemptCount}/${maxAttempts})`, error.message);
            }

            // 최대 시도 횟수 초과 시 포기
            if (attemptCount >= maxAttempts) {
                console.warn(`⏱️ 씬 ${scene.sceneNumber} 이미지 로딩 타임아웃 (${maxAttempts * 2}초 경과)`);
                clearInterval(interval);
            }
        }, 2000);  // [2025-11-11] 500ms → 2000ms (2초)

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [scene.sceneId, scene.sceneNumber]); 


    return (
        <div className="scene_book_wrapper">
            {/* 진행 상황 표시 */}
            <div className="scene_progress_top">
                <span>Scene {scene.sceneNumber} / {totalScenes}</span>
                <div className="progress_bar">
                    <div className="progress_fill"
                        style={{ width: `${(scene.sceneNumber / totalScenes) * 100}%` }}>
                    </div>
                </div>
            </div>

            {/* 본문 영역 */}
            <div className="scene_book_body">
                {/* 왼쪽: 이야기 */}
                <div className="scene_left">
                    <div className="scene_content">
                        <p style={{ whiteSpace: 'pre-line' }}>{scene.content}</p>
                    </div>
                </div>

                {/* 오른쪽: 이미지 + 선택지 + 입력 */}
                <div className="scene_right">

                    {/* 이미지 영역 */}
                    <div className="scene_image">
                        <ImageDisplay imagePrompt={scene.imagePrompt} imageUrl={imageUrl} />
                    </div>

                    {/* 선택지 및 입력란 */}
                    {scene.choices && scene.choices.length > 0 ? (
                        <>
                            {/* 선택지 영역 */}
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
                        </>
                    ) : (
                        // 마지막 씬(선택지 없음) - 완료 버튼만 표시
                        <div className="scene_ending">
                            <div className="ending_message">
                                <h2> 동화가 완료되었습니다!</h2>
                                <p>동화를 마무리하고 별을 받아보세요!</p>
                            </div>
                            <button
                                className="btn_complete_story"
                                onClick={() => onChoiceSelect({
                                    isEnding: true,  // 동화 완료 신호
                                    choiceText: "동화 완료",
                                    choiceId: 'story_complete'
                                })}
                            >
                                동화 완료하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SceneView;
