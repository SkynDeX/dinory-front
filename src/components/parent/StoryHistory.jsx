import React, { useEffect, useState } from "react";
import "./StoryHistory.css";
import { getStoryHistory } from "../../services/api/dashboardApi";

const EMOTION_LABELS = {
    // 한글
    "기뻐요": "😊",
    "슬퍼요": "😢",
    "화가 나요": "😠",
    "걱정돼요": "😰",
    "신나요": "🤩",
    "졸려요": "😴",
    // 영어 (백엔드에서 영어로 저장되는 경우 대비)
    "happy": "😊",
    "sad": "😢",
    "angry": "😠",
    "worried": "😰",
    "excited": "🤩",
    "sleepy": "😴"
};

function StoryHistory({ childId }) {
    const [stories, setStories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPeriod, setFilterPeriod] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        if (childId) {
            fetchStories();
        }
    }, [childId, filterPeriod]);

    const fetchStories = async () => {
        if (!childId) return;
       
        setLoading(true);
        try {
            // 날짜 범위 계산
            let startDate = null;
            let endDate = null;

            if (filterPeriod !== 'all') {
                const now = new Date();
                endDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

                switch (filterPeriod) {
                    case 'today':
                        startDate = endDate;
                        break;
                    case 'week':
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        startDate = weekAgo.toISOString().split('T')[0];
                        break;
                    case 'month':
                        const monthAgo = new Date(now);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        startDate = monthAgo.toISOString().split('T')[0];
                        break;
                    default:
                        break;
                }
            }

            const data = await getStoryHistory(childId, startDate, endDate, 0, 100);

            console.log('=== API 응답 데이터 ===');
            console.log('전체 응답:', data);
            console.log('completions:', data.completions);
            if (data.completions && data.completions.length > 0) {
                console.log('첫 번째 completion:', data.completions[0]);
            }

            // API 응답에서 completions 배열 추출
            setStories(data.completions || []);
            setStatistics(data.statistics || null);

        } catch (e) {
            console.error('동화 히스토리 조회 실패:', e);
            setStories([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const isInPeriod = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        switch (filterPeriod) {
            case "today":
                return diffDays === 0;
            case "week":
                return diffDays < 7;
            case "month":
                return diffDays < 30;
            case "all":
            default:
                return true;
        }
    };

    const filteredStories = stories.filter(story => {
        // 검색어 필터
        const matchesSearch = !searchTerm || 
            (story.storyTitle && story.storyTitle.toLowerCase().includes(searchTerm.toLowerCase()));

        // 상태 필터
        const matchesStatus = filterStatus === "all" || 
            (filterStatus === "completed" && story.completedAt) ||
            (filterStatus === "in-progress" && !story.completedAt);
    
        return matchesSearch && matchesStatus;
    });

    if (!childId) {
        return (
            <div className="story_history_wrapper">
                <div className="empty_state">
                    <h3>자녀를 선택해주세요</h3>
                    <p>동화 히스토리를 확인하려면 먼저 자녀를 선택해주세요.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="story_history_wrapper">
                <div className="loading_state">불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="story_history_wrapper">
            {/* 헤더 */}
            <div className="history_header">
                <div>
                    <h1 className="history_title">동화 히스토리</h1>
                    <p className="history_subtitle">완성한 동화: {filteredStories.length}개</p>
                </div>
            </div>

            {/* 간략한 통계 */}
            {statistics && (
                <div className="statistics_panel">
                    <div className="stat_item">
                        <span className="stat_value">{statistics.totalStories}</span>
                        <span className="stat_label">완료한 동화</span>
                    </div>
                    <div className="stat_item">
                        <span className="stat_value">{Math.round(statistics.totalReadTime / 60)}</span>
                        <span className="stat_label">총 읽은 시간(분)</span>
                    </div>
                    <div className="stat_item">
                        <span className="stat_value">{Math.round(statistics.averageDuration / 60)}</span>
                        <span className="stat_label">평균 소요 시간(분)</span>
                    </div>
                    <div className="stat_item">
                        <span className="stat_value">{statistics.consecutiveDays || 0}일</span>
                        <span className="stat_label">연속 학습</span>
                    </div>
                </div>
            )}

            {/* 검색 및 필터 */}
            <div className="history_filters">
                <input
                    type="text"
                    placeholder="동화 제목 검색..."
                    className="search_input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="filter_select"
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                >
                    <option value="all">전체 기간</option>
                    <option value="today">오늘</option>
                    <option value="week">이번 주</option>
                    <option value="month">이번 달</option>
                </select>

                <select
                    className="filter_select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">전체 상태</option>
                    <option value="completed">완료</option>
                    <option value="in-progress">진행 중</option>
                </select>
            </div>

            {/* 동화 목록 */}
            {filteredStories.length === 0 ? (
                <div className="empty_state">
                    {stories.length === 0 ? (
                        <>
                            <h3>📚 아직 완성한 동화가 없어요</h3>
                            <p>우리 아이와 함께 첫 동화를 만들어보세요!</p>
                        </>
                    ) : (
                        <>
                            <h3>검색 결과가 없습니다</h3>
                            <p>다른 검색어나 필터를 시도해보세요.</p>
                        </>
                    )}

                </div>
            ) : (
                <div className="story_list">
                    {filteredStories.map((story) => (
                        <div key={story.completionId} className="story_row">
                            <div className="story_row_content">
                                <div className="story_main_info">
                                    <h3 className="story_title">{story.storyTitle}</h3>
                                    {!story.completedAt && (
                                        <span className="status_badge in_progress">진행 중</span>
                                    )}
                                </div>

                                <div className="story_details">
                                    <span className="story_emotion">
                                        {EMOTION_LABELS[story.emotion]} {story.emotion}
                                    </span>

                                    {story.interests && story.interests.length > 0 && (
                                        <div className="story_interests">
                                            {story.interests.map((interest, idx) => (
                                                <span key={idx} className="interest_tag">
                                                    #{interest}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <span className="story_date">
                                        {formatDate(story.completedAt)} {formatTime(story.completedAt)}
                                    </span>

                                    <span className="story_duration">
                                        ⏱️ {Math.round(story.duration / 60)}분
                                    </span>
                                </div>
                            </div>

                            <button className="story_action_btn">
                                {story.completedAt ? "다시 보기" : "이어서 하기"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StoryHistory;