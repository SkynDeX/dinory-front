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
            </div>
        </div>
    );
}

export default SceneView;