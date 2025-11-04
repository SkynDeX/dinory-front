import React, { useState, useEffect } from "react";
import './GrowthReport.css';
import BeforeAfterRadar from "./charts/BeforeAfterRadar";
import { FaDownload } from "react-icons/fa";
import { getGrowthReport } from "../../services/api/dashboardApi";

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
            const data = await getGrowthReport(childId, period);
            console.log('성장 리포트:', data);
            setReportData(data);
            setLoading(false);

        } catch (e) {
            console.error("리포트 데이터 로딩 실패:", e);
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