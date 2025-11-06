import React from 'react';
import AbilityRadarChart from '../charts/AbilityRadarChart';
import './AbilitiesTab.css';

function AbilitiesTab({ data, period, aiInsights, insightsLoading }) {
    console.log('AbilitiesTab data:', data);
    console.log('abilityDetails:', data?.abilityDetails);
    console.log('relatedStories:', data?.relatedStories);

    if (!data || !data.abilities) {
        return <div className="empty_state">데이터가 없습니다.</div>;
    }

    const { abilities, abilityDetails, relatedStories } = data;

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
                                    <div className="ability_name_wrapper">
                                        <div className="ability_name">{ability.name}</div>
                                        <div className="ability_info_tooltip">
                                            <span className="info_icon">ⓘ</span>
                                            <div className="tooltip_content">
                                                {getAbilityComposition(ability.name)}
                                            </div>
                                        </div>
                                    </div>
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

                            {/* 관련 동화 */}
                            {relatedStories && relatedStories[ability.name] && relatedStories[ability.name].length > 0 && (
                                <div className="related_stories">
                                    <div className="related_stories_label">관련 동화:</div>
                                    <div className="story_badges">
                                        {relatedStories[ability.name].map((story, index) => (
                                            <div key={index} className="story_badge" title={story.date}>
                                                {story.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 능력별 아이콘
function getAbilityIcon(name) {
    const icons = {
        '정서 인식 및 조절': '💗',
        '사회적 상호작용': '🤝',
        '자아 개념': '⭐',
        '도전 및 적응력': '🦁',
        '창의성 및 문제해결': '🎨'
    };
    return icons[name] || '✨';
}

// 능력별 설명
function getAbilityDescription(name) {
    const descriptions = {
        '정서 인식 및 조절': '자신과 타인의 감정을 인식하고 적절하게 표현하는 능력',
        '사회적 상호작용': '친구들과 긍정적인 관계를 맺고 협력하는 능력',
        '자아 개념': '자신을 이해하고 책임감 있게 행동하는 능력',
        '도전 및 적응력': '새로운 상황에 용기있게 도전하고 적응하는 능력',
        '창의성 및 문제해결': '창의적으로 생각하고 문제를 해결하는 능력'
    };
    return descriptions[name] || '중요한 능력입니다';
}

// 능력별 색상
function getAbilityColor(name) {
    const colors = {
        '정서 인식 및 조절': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        '사회적 상호작용': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        '자아 개념': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        '도전 및 적응력': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        '창의성 및 문제해결': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
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

// 능력 구성 요소 설명
function getAbilityComposition(name) {
    const compositions = {
        '정서 인식 및 조절': '공감 80% + 책임감 20%',
        '사회적 상호작용': '우정 70% + 공감 30%',
        '자아 개념': '책임감 70% + 용기 30%',
        '도전 및 적응력': '용기 70% + 창의성 30%',
        '창의성 및 문제해결': '창의성 80% + 책임감 20%'
    };
    return compositions[name] || '능력 구성 정보';
}

export default AbilitiesTab;
