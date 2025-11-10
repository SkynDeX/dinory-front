import React from 'react';
import ChoicePatternChart from '../charts/ChoicePatternChart';
import EmotionLineChart from '../charts/EmotionLineChart';
import TopicCloud from '../charts/TopicCloud';
import './PatternsTab.css';

function PatternsTab({ data, period, topics = [], topicsLoading = false, psychAnalysis = "" }) {
    if (!data) {
        return <div className="empty_state">데이터가 없습니다.</div>;
    }

    const { choices = [], emotions = [] } = data;

    return (
        <div className="patterns_tab">
            {/* 선택 패턴 */}
            <div className="pattern_section">
                <h3 className="section_title">선택 스타일 분석</h3>
                <div className="pattern_card">
                    <div className="chart_wrapper">
                        <ChoicePatternChart data={choices} />
                    </div>
                    <div className="pattern_insights">
                        <br />
                        {choices.length > 0 ? (
                            <>
                                <div className="insight_item">
                                    <span className="insight_label">가장 많은 선택:</span>
                                    <span className="insight_value">{choices[0].name}</span>
                                </div>
                                <div className="insight_item">
                                    <span className="insight_label">비율:</span>
                                    <span className="insight_value">{choices[0].value}%</span>
                                </div>
                                <div className="insight_description">
                                    {getChoiceInsight(choices[0].name)}
                                </div>
                            </>
                        ) : (
                            <div className="no_data_message">아직 선택 데이터가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 감정 변화 */}
            <div className="emotion_section">
                <h3 className="section_title">감정 패턴</h3>
                <div className="emotion_card">
                    <EmotionLineChart data={emotions} period={period} />
                </div>
                {emotions.length > 0 && (
                    <div className="emotion_summary">
                        {getEmotionSummary(emotions)}
                    </div>
                )}
            </div>

            {/* 대화 주제 */}
            <div className="topic_section">
                <h3 className="section_title">관심 주제</h3>
                <div className="topic_card">
                    {topicsLoading ? (
                        <div className="topics_loading">
                            <div className="loading_spinner"></div>
                            <span className="loading_text">AI가 대화 주제를 분석 중입니다...</span>
                        </div>
                    ) : topics.length > 0 ? (
                        <TopicCloud topics={topics} />
                    ) : (
                        <div className="no_topics">아직 대화 기록이 없습니다.</div>
                    )}
                </div>

                {/* 심리 분석 카드 */}
                {psychAnalysis && !topicsLoading && (
                    <div className="psychological_analysis_card">
                        <div className="analysis_icon">🧠</div>
                        <div className="analysis_content">
                            <h4 className="analysis_title">AI 심리 분석</h4>
                            <p className="analysis_text">{psychAnalysis}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 선택 스타일별 인사이트
function getChoiceInsight(styleName) {
    const insights = {
        '도전적인 선택': '아이가 도전을 두려워하지 않고 용기 있게 행동하는 경향이 있어요. 새로운 상황에서도 과감하게 나아가는 모습을 보입니다.',
        '배려하는 선택': '다른 사람의 감정을 잘 헤아리고 배려하는 마음이 깊어요. 타인의 입장을 이해하려고 노력합니다.',
        '창의적인 선택': '새로운 아이디어를 내고 문제를 창의적으로 해결하는 능력이 뛰어나요. 상상력이 풍부합니다.',
        '책임감 있는 선택': '자신의 행동에 책임을 지고 약속을 잘 지켜요. 맡은 일을 성실하게 완수합니다.',
        '함께하는 선택': '친구들과 함께하는 것을 좋아하고 협동을 중요하게 생각해요. 좋은 관계를 만들어가는 능력이 있습니다.'
    };
    return insights[styleName] || '아이만의 특별한 선택 패턴을 보여주고 있어요.';
}

// 감정 요약
function getEmotionSummary(emotions) {
    const totalPositive = emotions.reduce((sum, e) => sum + (e.positive || 0), 0);
    const totalNegative = emotions.reduce((sum, e) => sum + (e.negative || 0), 0);
    const total = totalPositive + totalNegative;

    if (total === 0) return null;

    const positiveRatio = Math.round((totalPositive / total) * 100);

    return (
        <div className="emotion_summary_card">
            <div className="summary_icon">
                {positiveRatio >= 70 ? '😊' : positiveRatio >= 50 ? '😌' : '🤔'}
            </div>
            <div className="summary_content">
                <div className="summary_stats">
                    <div className="stat_item positive">
                        <span className="stat_label">긍정</span>
                        <span className="stat_value">{positiveRatio}%</span>
                    </div>
                    <div className="stat_item negative">
                        <span className="stat_label">부정</span>
                        <span className="stat_value">{100 - positiveRatio}%</span>
                    </div>
                </div>
                <div className="summary_text">
                    {positiveRatio >= 70
                        ? '매우 긍정적인 감정 상태를 보이고 있어요!'
                        : positiveRatio >= 50
                        ? '전반적으로 균형잡힌 감정 상태예요.'
                        : '다양한 감정을 경험하고 있어요. 함께 이야기 나눠보세요.'}
                </div>
            </div>
        </div>
    );
}

export default PatternsTab;
