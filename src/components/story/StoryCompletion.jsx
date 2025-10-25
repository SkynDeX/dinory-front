import React from "react";
import "./StoryCompletion.css";

function StoryCompletion({ storyTitle, onGoHome }) {
    return (
        <div className="story_completion_wrapper">
            <div className="completion_content">
                <div className="completion_icon">🎉</div>
                <h2>이야기를 모두 완성했어요!</h2>
                <p className="completion_message">
                    정말 멋진 선택들을 했어요!<br />
                    이제 새로운 공룡 친구를 만날 수 있어요!
                </p>

                <div className="completion_celebration">
                    <div className="star">⭐</div>
                    <div className="star">⭐</div>
                    <div className="star">⭐</div>
                </div>

                <button className="home_button" onClick={onGoHome}>
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    );
}

export default StoryCompletion;