import React, { useState, useEffect } from "react";
import "./StoryList.css";
import { useNavigate } from "react-router-dom";
import { getRecommendedStories } from '../../services/api/storyApi';
import StoryCard from "./StoryCard";
import DinoCharacter from "../dino/DinoCharacter";
import { useChild } from "../../context/ChildContext";
import LoadingScreen from "../common/LoadingScreen";

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
                10
            );

            console.log("API 응답:", recommendedStories); // 응답 확인

            // 응답이 배열인지 확인
            if (Array.isArray(recommendedStories)) {
                // storyId 기준으로 중복제거
                const uniqueStories = recommendedStories.filter((story, index, self) =>
                    index === self.findIndex((s) => s.title === story.title)
                );
                setStories(uniqueStories.slice(0,5));   // 화면에 보여지는 데이터는 5개로 지정
            } else {
                console.error("응답이 배열이 아닙니다:", recommendedStories);
                setStories([]);
            }
            
            setLoading(false);

        
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
        return <LoadingScreen message="동화를 찾는 중이에요..." />;
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