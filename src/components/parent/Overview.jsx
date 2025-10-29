import React, { useEffect, useState } from "react";
import { useChild } from "../../context/ChildContext"
import AbilityRadarChart from "./charts/AbilityRadarChart";
import EmotionLineChart from "./charts/EmotionLineChart";
import ChoicePatternChart from "./charts/ChoicePatternChart";
import TopicCloud from "./charts/TopicCloud";
import "./Overview.css";


function Overview({ childId }) {
    const [period, setPeriod] = useState("day");
    const [overviewData, setOverviewData] = useState(null);
    const [loading, setLoading] = useState();

    useEffect(() => {
        if (childId) {
            fetchOverviewData();
        }
    }, [childId, period]);

    const fetchOverviewData = async () => {
        setLoading(true);
        try {
            // 더미
            setOverviewData({
                abilities: {
                    감정인식: 85,
                    감정표현: 78,
                    공감능력: 92,
                    사회성: 75,
                    자신감: 88,
                    문제해결: 70,
                    회복탄력성: 82
                },
                emotionTrend: period === 'day' 
                    ? [
                        { label: '오전', positive: 70, negative: 30 },
                        { label: '점심', positive: 80, negative: 20 },
                        { label: '오후', positive: 65, negative: 35 },
                        { label: '저녁', positive: 75, negative: 25 }
                    ]
                    : period === 'week'
                    ? [
                        { label: '월', positive: 40, negative: 60 },
                        { label: '화', positive: 75, negative: 25 },
                        { label: '수', positive: 70, negative: 30 },
                        { label: '목', positive: 80, negative: 20 },
                        { label: '금', positive: 65, negative: 35 },
                        { label: '토', positive: 75, negative: 25 },
                        { label: '일', positive: 70, negative: 30 }
                    ]
                    : [
                        { label: '1주', positive: 68, negative: 32 },
                        { label: '2주', positive: 72, negative: 28 },
                        { label: '3주', positive: 65, negative: 35 },
                        { label: '4주', positive: 75, negative: 25 }
                    ],
                choicePattern: [
                    { name: '용감한 선택', value: 35, color: '#FF9B7A' },
                    { name: '신중한 선택', value: 25, color: '#87CEEB' },
                    { name: '친절한 선택', value: 30, color: '#2FA36B' },
                    { name: '창의적 선택', value: 10, color: '#FFD166' }
                ],
                conversationTopics: [
                    { text: "친구 관계", size: 24 },
                    { text: "유치원", size: 20 },
                    { text: "가족", size: 18 },
                    { text: "놀이", size: 18 },
                    { text: "감정", size: 16 },
                    { text: "학습", size: 16 },
                    { text: "동물", size: 14 },
                    { text: "음식", size: 14 },
                    { text: "날씨", size: 14 },
                    { text: "꿈", size: 14 }
                ],
                recentStories: [
                    { id: 1, title: "숲 속의 친구", date: "2025-01-15", emotion: "😊" },
                    { id: 2, title: "용감한 모험", date: "2025-01-14", emotion: "🤩" },
                    { id: 3, title: "마법의 정원", date: "2025-01-13", emotion: "😊" }
                ]
            });
        } catch (e) {
            console.error('Overview 데이터 조회 실패:', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="overview_wrapper">
                <div className="loading_state">불러오는 중...</div>
            </div>
        );
    }

    if (!overviewData) {
        return(
            <div className="overview_wrapper">
                <div className="loading_state">데이터를 불러오는 중...</div>
            </div>
        );
    }

    return(
        <div className="overview_wrapper">
            {/* 헤더 */}
            <div className="overview_header">
                <h1 className="overview_title">대시보드</h1>
                <div className="period_filters">
                    <button
                        className={`period_btn ${period === 'day' ? 'active' : ''}`}
                        onClick={() => setPeriod('day')}
                    >
                        일간
                    </button>
                    <button
                        className={`period_btn ${period === 'week' ? 'active' : ''}`}
                        onClick={() => setPeriod('week')}
                    >
                        주간
                    </button>
                    <button
                        className={`period_btn ${period === 'month' ? 'active' : ''}`}
                        onClick={() => setPeriod('month')}
                    >
                        월간
                    </button>
                </div>
            </div>

            {/* 차트 영역 */}
            <div className="charts_grid">
                {/* 능력 발달 레이더 차트 */}
                <div className="chart_card">
                    <h3 className="chart_title">능력 발달 현황</h3>
                    <div className="chart_container">
                        <AbilityRadarChart data={overviewData.abilities}/>
                    </div>
                </div>

                {/* 감정 추이 라인 차트 */}
                <div className="chart_card">
                    <h3 className="chart_title">감정 변화 추이</h3>
                    <div className="chart_container">
                        <EmotionLineChart data={overviewData.emotionTrend} period={period} />
                    </div>
                </div>

                {/* 선택 패턴 도넛 차트 */}
                <div className="chart_card">
                    <h3 className="chart_title">선택 패턴 분석</h3>
                    <div className="chart_container">
                        <ChoicePatternChart data={overviewData.choicePattern} />
                    </div>
                </div>

                {/* 관심사 태그 클라우드 */}
                <div className="chart_card">
                    <h3 className="chart_title">대화 주제 분석</h3>
                    <TopicCloud topics={overviewData.conversationTopics} />
                </div>
            </div>

            {/* 최근 동화 목록 */}
            <div className="recent_stories_section">
                <h3 className="section_title">최근 완료한 동화</h3>
                <div className="recent_stories_list">
                    {overviewData.recentStories.map(story => (
                        <div key={story.id} className="recent_story_item">
                            <span className="story_emotion">{story.emotion}</span>
                            <div className="story_info">
                                <h4 className="story_title">{story.title}</h4>
                                <span className="story_date">{story.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Overview;