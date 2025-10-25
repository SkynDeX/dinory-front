import React from "react";
import "./StoryCard.css"

function StoryCard({story, onSelect}) {
    return (
        <div 
            className="story_card"
            onClick={() => onSelect(story)}>
                <div className="story_cover">
                    {story.coverImage ? (
                        <img src={story.coverImage} alt={story.title}/>
                    ) : (
                        <div className="story_placeholder">📖</div>
                    )}
                </div>
                <div className="story_info">
                    <h3 className="story_title">{story.title}</h3>
                    <p className="story_description">{story.description}</p>
                    <div className="story_meta">
                        {story.thema && story.thema.length > 0 && (
                            <span className="story_theme">
                                {story.theme.join(",")}
                            </span>
                        )}
                        {story.estimatedTime && (
                            <span className="story_time">
                                ⏱️ 약 {story.estimatedTime}분
                            </span>
                        )}
                    </div>
                </div>
        </div>
    );
}

export default StoryCard;