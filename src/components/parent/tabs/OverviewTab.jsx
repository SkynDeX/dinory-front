import React from 'react';
import './OverviewTab.css';

function OverviewTab({ data, period, aiInsights, insightsLoading }) {
    if (!data || !data.recentStories) {
        return <div className="empty_state">데이터가 없습니다.</div>;
    }

    const { abilities = {}, recentStories = [], emotions = [], choices = [] } = data;

    // 인사이트 카드 데이터 계산
    const totalStories = recentStories.length;
    const topAbility = Object.entries(abilities).sort((a, b) => b[1] - a[1])[0];
    const topChoice = choices.length > 0 ? choices[0] : null;

    // 긍정/부정 감정 비율 계산
    const positiveCount = emotions.reduce((sum, e) => sum + (e.positive || 0), 0);
    const negativeCount = emotions.reduce((sum, e) => sum + (e.negative || 0), 0);
    const totalEmotions = positiveCount + negativeCount;
    const positiveRatio = totalEmotions > 0 ? Math.round((positiveCount / totalEmotions) * 100) : 0;

    return (
        <div className="overview_tab">
            {/* 인사이트 카드 */}
            <div className="insight_cards">
                <div className="insight_card">
                    <div className="insight_icon">📚</div>
                    <div className="insight_content">
                        <span className="insight_label">
                            {period === 'day' ? '오늘' : period === 'week' ? '이번 주' : '이번 달'}
                        </span>
                        <div className="insight_value">{totalStories}개</div>
                        <div className="insight_desc">동화 완료</div>
                    </div>
                </div>

                {topAbility && (
                    <div className="insight_card">
                        <div className="insight_icon">📈</div>
                        <div className="insight_content">
                            <span className="insight_label">가장 높은 능력</span>
                            <div className="insight_value">{topAbility[0]}</div>
                            <div className="insight_desc">{Math.round(topAbility[1])}점</div>
                        </div>
                    </div>
                )}

                {topChoice && (
                    <div className="insight_card">
                        <div className="insight_icon">🎯</div>
                        <div className="insight_content">
                            <span className="insight_label">주요 선택 스타일</span>
                            <div className="insight_value">{topChoice.name}</div>
                            <div className="insight_desc">{topChoice.value}%</div>
                        </div>
                    </div>
                )}

                <div className="insight_card">
                    <div className="insight_icon">😊</div>
                    <div className="insight_content">
                        <span className="insight_label">긍정 감정 비율</span>
                        <div className="insight_value">{positiveRatio}%</div>
                        <div className="insight_desc">
                            {positiveRatio >= 70 ? '매우 좋음' : positiveRatio >= 50 ? '좋음' : '보통'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 최근 읽은 동화 3개 */}
            <div className="recent_stories_section">
                <h3 className="section_title">최근 읽은 동화</h3>
                <div className="recent_stories_grid">
                    {recentStories.length > 0 ? (
                        recentStories.slice(0, 3).map((story, idx) => {
                            // totalTime 계산: 초 단위라고 가정하고 분으로 변환
                            const minutes = story.totalTime
                                ? (story.totalTime > 1000
                                    ? Math.round(story.totalTime / 60000) // 밀리초인 경우
                                    : story.totalTime > 60
                                        ? Math.round(story.totalTime / 60) // 초인 경우
                                        : story.totalTime) // 이미 분 단위인 경우
                                : 0;

                            return (
                                <div key={idx} className="story_card">
                                    <div className="story_number">#{idx + 1}</div>
                                    <div className="story_title">{story.title}</div>
                                    <div className="story_meta">
                                        <span className="story_date">
                                            {new Date(story.completedAt).toLocaleDateString('ko-KR', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <span className="story_time">{minutes}분</span>
                                    </div>
                                    {story.emotion && (
                                        <div className="story_emotion">{story.emotion}</div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="empty_stories">아직 읽은 동화가 없습니다.</div>
                    )}
                </div>
            </div>

            {/* Quick 인사이트 */}
            <div className="quick_insight_section">
                <div className="quick_insight_card">
                    <div className="insight_icon_large">💡</div>
                    <div className="insight_text">
                        {insightsLoading ? (
                            <span className="loading_text">AI가 분석 중입니다...</span>
                        ) : aiInsights?.quickInsight ? (
                            aiInsights.quickInsight
                        ) : (
                            topAbility && topChoice ? (
                                <>
                                    <strong>{topAbility[0]}</strong> 능력이 가장 높고, <strong>{topChoice.name}</strong>을(를) 주로 하고 있어요.
                                    {topAbility[1] < 50 && ' 다양한 동화를 통해 더 성장할 수 있어요!'}
                                </>
                            ) : (
                                '아이와 함께 동화를 읽으며 성장해보세요!'
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OverviewTab;
