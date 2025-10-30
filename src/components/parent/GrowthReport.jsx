import React, { useState, useEffect } from "react";
import './GrowthReport.css';
import BeforeAfterRadar from "./charts/BeforeAfterRadar";
import { FaDownload } from "react-icons/fa";

function GrowthReport({ childId }) {
    const [period, setPeriod] = useState("month");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (childId) {
            fetchReportData();
        }
    }, [childId, period]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // TODO: API 연동
            // const data = await getGrowthReport(childId, period);

            // 임시 더미 데이터
            setTimeout(() => {
                setReportData({
                    comparison: {
                        start: {
                            감정인식: 65,
                            감정표현: 70,
                            공감능력: 60,
                            사회성: 55,
                            자신감: 68,
                            문제해결: 62,
                            회복탄력성: 58
                        },
                        end: {
                            감정인식: 78,
                            감정표현: 82,
                            공감능력: 75,
                            사회성: 70,
                            자신감: 80,
                            문제해결: 73,
                            회복탄력성: 68
                        }
                    },
                    aiEvaluation: "지난 한 달간 아이는 감정 표현과 자신감 영역에서 두드러진 성장을 보였습니다. 특히 동화 속 주인공의 감정을 이해하고 자신의 경험과 연결하는 능력이 크게 향상되었습니다. 사회성 영역에서도 점진적인 발전이 관찰되며, 다양한 상황에서 적절한 선택을 하는 모습을 보이고 있습니다.",
                    strengths: [
                        {
                            area: "감정표현",
                            score: 82,
                            description: "자신의 감정을 명확하게 표현하고, 다양한 감정 어휘를 사용합니다.",
                            example: "슬픈 장면에서 '주인공이 외로워 보여요. 저도 친구가 없을 때 그랬어요'라고 표현했습니다."
                        },
                        {
                            area: "자신감",
                            score: 80,
                            description: "어려운 선택 상황에서도 자신의 의견을 자신 있게 제시합니다.",
                            example: "동화 속 갈림길에서 '나는 이 길로 갈래요. 더 재미있을 것 같아요'라고 결정했습니다."
                        }
                    ],
                    growthAreas: [
                        {
                            area: "회복탄력성",
                            score: 68,
                            description: "실패나 어려움 상황에서 회복하는 능력을 더 키울 수 있습니다.",
                            recommendation: "실패를 긍정적으로 받아들이는 이야기를 함께 읽어보세요."
                        },
                        {
                            area: "사회성",
                            score: 70,
                            description: "친구 관계에서의 갈등 해결 능력을 향상시킬 수 있습니다.",
                            recommendation: "협동과 타협을 주제로 한 동화를 추천합니다."
                        }
                    ],
                    milestones: [
                        { achievement: "처음으로 복잡한 감정을 표현함", date: "2025-10-15" },
                        { achievement: "어려운 선택 상황 5회 연속 해결", date: "2025-10-20" },
                        { achievement: "공감 능력 75점 달성", date: "2025-10-25" }
                    ],
                    recommendations: [
                        {
                            priority: 1,
                            activity: "감정 일기 쓰기",
                            description: "하루에 느낀 감정을 그림이나 짧은 글로 표현하기",
                            targetArea: "감정인식"
                        },
                        {
                            priority: 2,
                            activity: "역할극 놀이",
                            description: "친구나 가족과 함께 동화 속 인물이 되어 상황 재연하기",
                            targetArea: "사회성"
                        },
                        {
                            priority: 3,
                            activity: "도전 과제 설정",
                            description: "작은 목표를 정하고 실패해도 다시 시도하기",
                            targetArea: "회복탄력성"
                        }
                    ]
                });
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error("리포트 데이터 로딩 실패:", error);
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        // TODO: PDF 다운로드 기능 구현
        alert("PDF 다운로드 기능은 추후 구현 예정입니다.");
    };

    if (loading) {
        return (
            <div className="loading_state">
                <p>리포트를 생성하고 있습니다...</p>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="empty_state">
                <h3>리포트 데이터가 없습니다</h3>
                <p>충분한 동화 활동 후 리포트가 생성됩니다.</p>
            </div>
        );
    }

    return (
        <div className="growth_report_wrapper">
            {/* 헤더 */}
            <div className="report_header">
                <h1 className="report_title">성장 리포트</h1>
                <div className="report_controls">
                    <div className="period_filters">
                        <button
                            className={`period_btn ${period === 'month' ? 'active' : ''}`}
                            onClick={() => setPeriod('month')}
                        >
                            월간
                        </button>
                        <button
                            className={`period_btn ${period === 'quarter' ? 'active' : ''}`}
                            onClick={() => setPeriod('quarter')}
                        >
                            분기
                        </button>
                        <button
                            className={`period_btn ${period === 'halfyear' ? 'active' : ''}`}
                            onClick={() => setPeriod('halfyear')}
                        >
                            반기
                        </button>
                    </div>
                    <button className="download_btn" onClick={handleDownloadPDF}>
                        <FaDownload /> PDF 다운로드
                    </button>
                </div>
            </div>

            {/* Before/After 비교 차트 */}
            <div className="report_section">
                <h2 className="section_title">성장 비교</h2>
                <div className="chart_card">
                    <BeforeAfterRadar data={reportData.comparison} />
                </div>
            </div>

            {/* AI 종합 평가 */}
            <div className="report_section">
                <h2 className="section_title">AI 종합 평가</h2>
                <div className="ai_evaluation_card">
                    <p className="ai_evaluation_text">{reportData.aiEvaluation}</p>
                </div>
            </div>

            {/* 강점 영역 */}
            <div className="report_section">
                <h2 className="section_title">강점 영역</h2>
                <div className="areas_grid">
                    {reportData.strengths.map((strength, idx) => (
                        <div key={idx} className="area_card strength_card">
                            <div className="area_header">
                                <h3 className="area_name">{strength.area}</h3>
                                <span className="area_score">{strength.score}점</span>
                            </div>
                            <p className="area_description">{strength.description}</p>
                            <div className="area_example">
                                <strong>예시:</strong> {strength.example}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 성장 가능 영역 */}
            <div className="report_section">
                <h2 className="section_title">성장 가능 영역</h2>
                <div className="areas_grid">
                    {reportData.growthAreas.map((area, idx) => (
                        <div key={idx} className="area_card growth_card">
                            <div className="area_header">
                                <h3 className="area_name">{area.area}</h3>
                                <span className="area_score">{area.score}점</span>
                            </div>
                            <p className="area_description">{area.description}</p>
                            <div className="area_recommendation">
                                <strong>추천:</strong> {area.recommendation}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 성취 마일스톤 */}
            <div className="report_section">
                <h2 className="section_title">성취 마일스톤</h2>
                <div className="milestones_list">
                    {reportData.milestones.map((milestone, idx) => (
                        <div key={idx} className="milestone_item">
                            <div className="milestone_icon">🏆</div>
                            <div className="milestone_content">
                                <p className="milestone_achievement">{milestone.achievement}</p>
                                <span className="milestone_date">{milestone.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 추천 활동 */}
            <div className="report_section">
                <h2 className="section_title">추천 활동</h2>
                <div className="recommendations_list">
                    {reportData.recommendations.map((rec, idx) => (
                        <div key={idx} className="recommendation_item">
                            <div className="recommendation_priority">
                                <span className="priority_badge">우선순위 {rec.priority}</span>
                                <span className="target_area_badge">{rec.targetArea}</span>
                            </div>
                            <h3 className="recommendation_title">{rec.activity}</h3>
                            <p className="recommendation_description">{rec.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default GrowthReport;