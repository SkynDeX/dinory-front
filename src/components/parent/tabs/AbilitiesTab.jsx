import React from 'react';
import AbilityRadarChart from '../charts/AbilityRadarChart';
import './AbilitiesTab.css';

function AbilitiesTab({ data, period, aiInsights, insightsLoading }) {
    if (!data || !data.abilities) {
        return <div className="empty_state">데이터가 없습니다.</div>;
    }

    const { abilities } = data;

    // 능력별 데이터 정리
    const abilityList = Object.entries(abilities)
        .map(([name, score]) => ({
            name,
            score: Math.round(score),
            icon: getAbilityIcon(name),
            description: getAbilityDescription(name),
            color: getAbilityColor(name)
        }))
        .sort((a, b) => b.score - a.score);

    return (
        <div className="abilities_tab">
            {/* 레이더 차트 */}
            <div className="radar_section">
                <h3 className="section_title">능력 종합 현황</h3>
                <div className="radar_card">
                    <AbilityRadarChart data={data} />
                </div>
            </div>

            {/* 능력별 카드 */}
            <div className="ability_cards_section">
                <h3 className="section_title">능력별 상세</h3>
                <div className="ability_cards_grid">
                    {abilityList.map((ability) => (
                        <div key={ability.name} className="ability_card">
                            <div className="ability_header">
                                <div className="ability_icon">{ability.icon}</div>
                                <div className="ability_info">
                                    <div className="ability_name">{ability.name}</div>
                                    <div className="ability_score">{ability.score}점</div>
                                </div>
                            </div>

                            {/* 점수 바 */}
                            <div className="ability_bar_container">
                                <div
                                    className="ability_bar"
                                    style={{
                                        width: `${ability.score}%`,
                                        background: ability.color
                                    }}
                                />
                                <span className="ability_percentage">{ability.score}%</span>
                            </div>

                            {/* 설명 */}
                            <div className="ability_description">
                                {ability.description}
                            </div>

                            {/* 레벨 표시 */}
                            <div className="ability_level">
                                <span className="level_label">레벨:</span>
                                <span className={`level_badge level_${getLevel(ability.score)}`}>
                                    {getLevelText(ability.score)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 추천 활동 섹션 */}
            <div className="recommendation_section">
                <h3 className="section_title">추천 활동</h3>
                <div className="recommendation_card">
                    <div className="recommendation_icon">💡</div>
                    <div className="recommendation_content">
                        {abilityList[0] && abilityList[abilityList.length - 1] && (
                            <>
                                <div className="recommendation_text">
                                    {insightsLoading ? (
                                        <span className="loading_text">AI가 추천을 생성 중입니다...</span>
                                    ) : aiInsights?.recommendation ? (
                                        <>
                                            <strong>{aiInsights.recommendation.ability}</strong> 능력이 상대적으로 낮아요. {aiInsights.recommendation.message}
                                        </>
                                    ) : (
                                        <>
                                            <strong>{abilityList[abilityList.length - 1].name}</strong> 능력이 상대적으로 낮아요.
                                            관련 동화를 함께 읽으면서 키워보는 건 어떨까요?
                                        </>
                                    )}
                                </div>
                                <button className="recommendation_btn">
                                    {aiInsights?.recommendation?.ability || abilityList[abilityList.length - 1].name} 동화 보러가기 →
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 능력별 아이콘
function getAbilityIcon(name) {
    const icons = {
        '용기': '🦁',
        '공감': '💗',
        '창의성': '🎨',
        '책임감': '⭐',
        '우정': '🤝',
        '친절': '😊',
        '자존감': '💪'
    };
    return icons[name] || '✨';
}

// 능력별 설명
function getAbilityDescription(name) {
    const descriptions = {
        '용기': '두려움을 극복하고 도전하는 힘',
        '공감': '다른 사람의 감정을 이해하고 공유하는 능력',
        '창의성': '새로운 아이디어를 생각해내는 능력',
        '책임감': '맡은 일을 끝까지 해내는 능력',
        '우정': '친구와 관계를 맺고 유지하는 능력',
        '친절': '다른 사람을 배려하고 도와주는 마음',
        '자존감': '자신을 소중히 여기고 긍정적으로 생각하는 능력'
    };
    return descriptions[name] || '중요한 능력입니다';
}

// 능력별 색상
function getAbilityColor(name) {
    const colors = {
        '용기': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        '공감': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        '창의성': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        '책임감': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        '우정': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        '친절': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        '자존감': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    };
    return colors[name] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

// 레벨 계산
function getLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

function getLevelText(score) {
    if (score >= 80) return '우수';
    if (score >= 60) return '보통';
    return '성장 필요';
}

export default AbilitiesTab;
