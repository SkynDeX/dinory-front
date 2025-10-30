import React from "react";
import "./SceneView.css";
import ChoiceButton from "./ChoiceButton";
import ImageDisplay from "./ImageDisplay";

function SceneView({ scene, totalScenes, onChoiceSelect }) {
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
            <ImageDisplay imagePrompt={scene.imagePrompt} imageUrl={scene.imageUrl}/>

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