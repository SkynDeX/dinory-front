import React, { useState, useEffect } from "react";
import "./StoryList.css";
import { useNavigate } from "react-router-dom";
import { getRecommendedStories } from '../../services/api/storyApi';
import StoryCard from "./StoryCard";
import DinoCharacter from "../dino/DinoCharacter";
import { useChild } from "../../context/ChildContext";

function StoryList() {
    const [stories, setStories] = useState([]);
    const [loding, setLoading] = useState(true);
    const navigate = useNavigate();
    const { selectedChild, selectedEmotion, selectedInterests } = useChild();

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            // 감정/관심사 가져오기          
            const emotion = selectedEmotion?.id;
            const childId = selectedChild?.id;

            console.log("동화 추천 요청: ", {emotion, interests:selectedInterests, childId});

            const recommendedStories = await getRecommendedStories(
                emotion,
                selectedInterests,
                childId,
                5
            );

            console.log("API 응답:", recommendedStories); // 응답 확인

            // 응답이 배열인지 확인
            if (Array.isArray(recommendedStories)) {
                setStories(recommendedStories);
            } else {
                console.error("응답이 배열이 아닙니다:", recommendedStories);
                setStories([]);
            }
            
            setLoading(false);

            // setStories(recommendedStories);
            // setLoading(false);
        
        } catch (error) {
            console.error("동화 추천 실패: ", error);
            alert("동화 추천을 불러오는데 실패했습니다.");
            setLoading(false);
        }
    };

    const handleStorySelect = (story) => {
        // 동화 읽기 페이지로 이동
        navigate(`/story/${story.storyId}`);
    };

    if(loding) {
        return (
            <div className="story_list_wrapper">
                <div className="loding">동화를 찾는 중...</div>
            </div>
        );
    }

    return (
        <div className="story_list_wrapper">
            <div className="story_list_header">
                <h2>너를 위한 특별한 이야기</h2>
                <p>어떤 이야기를 듣고 싶어?</p>
            </div>

            <div className="stories_grid">
                {stories.map((story) => (
                    <StoryCard 
                        key={story.storyId}
                        story={story}
                        onSelect={handleStorySelect}
                    />
                ))}
            </div>

            <DinoCharacter />
        </div>
    );
}

export default StoryList;