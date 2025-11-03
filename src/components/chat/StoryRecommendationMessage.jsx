import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StoryRecommendationMessage.css';

const StoryRecommendationMessage = ({ recommendations }) => {
  const navigate = useNavigate();

  const handleStoryClick = (storyId) => {
    console.log('[StoryRecommendation] 동화 선택:', storyId);
    navigate(`/story/${storyId}`);
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="story-recommendation-message">
      <div className="recommendation-header">
        <div className="dino-suggest">🦕</div>
        <div className="suggestion-text">
          <h3>이런 동화는 어때? 📚</h3>
          <p>너에게 딱 맞는 이야기들을 골라봤어!</p>
        </div>
      </div>

      <div className="story-cards">
        {recommendations.map((story) => (
          <div
            key={story.storyId}
            className="story-card"
            onClick={() => handleStoryClick(story.storyId)}
          >
            {story.coverImageUrl && (
              <div className="story-card-image">
                <img src={story.coverImageUrl} alt={story.title} />
                {story.matchingScore && (
                  <div className="matching-badge">
                    매칭도 {story.matchingScore}%
                  </div>
                )}
              </div>
            )}

            <div className="story-card-content">
              <h4 className="story-card-title">{story.title}</h4>

              {story.themes && story.themes.length > 0 && (
                <div className="story-themes">
                  {story.themes.map((theme, index) => (
                    <span key={index} className="theme-badge">
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {story.description && (
                <p className="story-description">
                  {story.description.length > 60
                    ? `${story.description.substring(0, 60)}...`
                    : story.description}
                </p>
              )}

              {story.estimatedTime && (
                <div className="story-time">
                  <span className="time-icon">⏱️</span>
                  <span className="time-text">약 {story.estimatedTime}분</span>
                </div>
              )}

              <button className="read-story-btn">
                이야기 읽으러 가기 →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="recommendation-footer">
        <p>💡 마음에 드는 이야기를 눌러보세요!</p>
      </div>
    </div>
  );
};

export default StoryRecommendationMessage;
