import React, { useState, useEffect } from "react";
import './GrowthReport.css';
import BeforeAfterRadar from "./charts/BeforeAfterRadar";
import { FaDownload } from "react-icons/fa";
import { getGrowthReport, getGrowthReportAIAnalysis } from "../../services/api/dashboardApi";
import DateRangePicker from "../common/DateRangePicker";
import html2pdf from 'html2pdf.js';


function GrowthReport({ childId, childName }) {
    const [period, setPeriod] = useState("month");
    const [customDateRange, setCustomDateRange] = useState(null);
    const [savedCustomDates, setSavedCustomDates] = useState({ start: '', end: '' });
    const [reportData, setReportData] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (childId) {
            fetchReportData();
            fetchAIAnalysis();
        }
    }, [childId, period, customDateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const opts = customDateRange
                ? { period, startDate: customDateRange.start, endDate: customDateRange.end }
                : { period };
            const data = await getGrowthReport(childId, opts);
            console.log('성장 리포트 기본 데이터:', data);
            setReportData(data);
            setLoading(false);
        } catch (e) {
            console.error("리포트 데이터 로딩 실패:", e);
            setLoading(false);
        }
    };

    const fetchAIAnalysis = async () => {
        setAiLoading(true);
        setAiAnalysis(null);
        try {
            const opts = customDateRange
                ? { period, startDate: customDateRange.start, endDate: customDateRange.end }
                : { period };
            const data = await getGrowthReportAIAnalysis(childId, opts);
            console.log('성장 리포트 AI 분석:', data);
            setAiAnalysis(data);
        } catch (e) {
            console.error("AI 분석 로딩 실패:", e);
            setAiAnalysis({
                aiEvaluation: "AI 분석을 불러오는데 실패했습니다.",
                strengthDescriptions: [],
                growthAreaDescriptions: [],
                milestones: [],
                recommendations: []
            });
        } finally {
            setAiLoading(false);
        }
    };

   

    const handleDownloadPDF = async () => {
        try {
            const element = document.querySelector('.growth_report_wrapper');

            // PDF 다운로드 버튼 숨기기
            const downloadBtn = document.querySelector('.download_btn');
            if (downloadBtn) downloadBtn.style.display = 'none';

            // 파일명: 성장리포트_아이이름_날짜.pdf
            const name = childName || '자녀';
            const today = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '');
            const filename = `성장리포트_${name}_${today}.pdf`;

            const opt = {
                margin: [20, 20, 20, 20],
                filename: filename,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollY: 0,
                    scrollX: 0,
                    // windowWidth: element.scrollWidth,
                    // windowHeight: element.scrollHeight
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: {
                    mode: ['css', 'legacy'],
                    before: '.pdf_page_break',
                    avoid: '.pdf_no_break'
                }
            };

            await html2pdf().set(opt).from(element).save();

            // 버튼 다시 보이기
            if (downloadBtn) downloadBtn.style.display = '';

            alert('PDF 다운로드가 완료되었습니다.');
        } catch (e) {
            console.error('PDF 다운로드 실패:', e);
            alert('PDF 다운로드에 실패했습니다.');

            // 에러 시에도 버튼 다시 보이기
            const downloadBtn = document.querySelector('.download_btn');
            if (downloadBtn) downloadBtn.style.display = '';
        }
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
            {/* 페이지 1: 제목 + 날짜 + AI 종합 평가 */}
            <div className="pdf_no_break">
                {/* 헤더 */}
                <div className="report_header_container">
                    <div className="report_header_top">
                        <h1 className="report_title">성장 리포트</h1>
                        <button
                            className="download_btn"
                            onClick={handleDownloadPDF}
                            disabled={loading || aiLoading}
                            style={{
                                opacity: loading || aiLoading ? 0.5 : 1,
                                cursor: loading || aiLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <FaDownload /> {loading || aiLoading ? 'AI 분석 중' : 'PDF 다운로드'}
                        </button>
                    </div>
                    <div className="report_header_bottom">
                        <DateRangePicker
                            mode="report"
                            period={period}
                            initialStart={savedCustomDates.start}
                            initialEnd={savedCustomDates.end}
                            onPeriodChange={(newPeriod) => {
                                setPeriod(newPeriod);
                                setCustomDateRange(null);
                                setSavedCustomDates({ start: '', end: '' }); // 사용자 지정 날짜 초기화
                            }}
                            onDateRangeChange={(start, end) => {
                                setSavedCustomDates({ start, end });
                                setCustomDateRange({ start, end });
                            }}
                        />
                    </div>
                </div>

                {/* AI 종합 평가 */}
                <div className="report_section">
                    <h2 className="section_title">AI 종합 평가</h2>
                    <div className="ai_evaluation_card">
                        {aiLoading ? (
                            <div className="ai_loading">
                                <div className="loading_spinner"></div>
                                <span className="loading_text">AI가 종합 평가를 생성 중입니다.</span>
                                <span className="loading_text">잠시만 기다려주세요!</span>
                            </div>
                        ) : (
                            <div className="ai_evaluation_text">
                                {(aiAnalysis?.aiEvaluation || "AI 평가를 불러오는 중...")
                                    .split('\n\n')
                                    .filter(paragraph => paragraph.trim())
                                    .map((paragraph, index) => (
                                        <p key={index} className="evaluation_paragraph">
                                            {paragraph.trim()}
                                        </p>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 페이지 2: 차트 */}
            <div className="pdf_page_break">
                <div className="report_section pdf_no_break">
                    <h2 className="section_title">성장 비교</h2>
                    <div className="chart_card">
                        <BeforeAfterRadar data={reportData.comparison} />
                    </div>
                </div>
            </div>

            {/* 페이지 3: 강점 영역 */}
            <div className="pdf_page_break">
                <div className="report_section">
                <h2 className="section_title">강점 영역</h2>
                <div className="areas_grid">
                    {reportData.strengths.map((strength, idx) => {
                        const aiStrength = aiAnalysis?.strengthDescriptions?.find(s => s.area === strength.area);
                        const areaName = strength.area ? strength.area.replace(/\s*\(.*?\)\s*/g, '').trim() : '';
                        return (
                            <div key={idx} className="area_card strength_card pdf_no_break">
                                <div className="area_header">
                                    <h3 className="area_name">{areaName}</h3>
                                    <span className="area_score">{strength.score}점</span>
                                </div>
                                {aiLoading ? (
                                    <div className="area_loading">
                                        <span className="loading_text">아이의 강점 영역을 분석하고 있어요!</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="area_description">{aiStrength?.description || strength.description || "분석 중..."}</p>
                                        {(aiStrength?.examples || strength.examples) && (
                                            <div className="area_example">
                                                <strong>예시:</strong>
                                                <ul>
                                                    {(aiStrength?.examples || strength.examples).map((example, i) => (
                                                        <li key={i}>{example}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            </div>

            {/* 페이지 3: 성장 영역, 마일스톤, 추천 활동 */}
            <div>
            {/* 성장 가능 영역 */}
            <div className="report_section">
                <h2 className="section_title">성장 가능 영역</h2>
                <div className="areas_grid">
                    {reportData.growthAreas.map((area, idx) => {
                        const aiGrowth = aiAnalysis?.growthAreaDescriptions?.find(g => g.area === area.area);
                        const areaName = area.area ? area.area.replace(/\s*\(.*?\)\s*/g, '').trim() : '';
                        return (
                            <div key={idx} className="area_card growth_card">
                                <div className="area_header">
                                    <h3 className="area_name">{areaName}</h3>
                                    <span className="area_score">{area.score}점</span>
                                </div>
                                {aiLoading ? (
                                    <div className="area_loading">
                                        <span className="loading_text">아이의 성장 가능 영역을 분석하고 있어요!</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="area_description">{aiGrowth?.description || area.description || "분석 중..."}</p>
                                        {(aiGrowth?.examples || area.examples) && (
                                            <div className="area_example">
                                                <strong>예시:</strong>
                                                <ul>
                                                    {(aiGrowth?.examples || area.examples).map((example, i) => (
                                                        <li key={i}>{example}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div className="area_recommendation">
                                            <strong>추천:</strong> {aiGrowth?.recommendation || area.recommendation || "분석 중..."}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 성취 마일스톤 */}
            <div className="report_section">
                <h2 className="section_title">성취 마일스톤</h2>
                {aiLoading ? (
                    <div className="ai_loading">
                        <div className="loading_spinner"></div>
                        <span className="loading_text">마일스톤을 분석하고 있어요!</span>
                    </div>
                ) : aiAnalysis?.milestones?.length > 0 ? (
                    <div className="milestones_list">
                        {aiAnalysis.milestones.map((milestone, idx) => (
                            <div key={idx} className="milestone_item">
                                <div className="milestone_icon">🏆</div>
                                <div className="milestone_content">
                                    <p className="milestone_achievement">{milestone.achievement}</p>
                                    <span className="milestone_date">{milestone.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty_section">아직 마일스톤이 없습니다.</div>
                )}
            </div>

            {/* 추천 활동 */}
            <div className="report_section">
                <h2 className="section_title">추천 활동</h2>
                {aiLoading ? (
                    <div className="ai_loading">
                        <div className="loading_spinner"></div>
                        <span className="loading_text">추천 활동을 생성하고 있어요!</span>
                    </div>
                ) : aiAnalysis?.recommendations?.length > 0 ? (
                    <div className="recommendations_list">
                        {aiAnalysis.recommendations.map((rec, idx) => (
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
                ) : (
                    <div className="empty_section">추천 활동을 생성 중입니다...</div>
                )}
            </div>
            </div>
        </div>
    );
}

export default GrowthReport;