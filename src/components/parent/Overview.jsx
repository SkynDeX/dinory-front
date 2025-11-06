import React, { useEffect, useState } from "react";
import { getOverview, getAIInsights, getTopics } from '../../services/api/dashboardApi';
import OverviewTab from "./tabs/OverviewTab";
import AbilitiesTab from "./tabs/AbilitiesTab";
import PatternsTab from "./tabs/PatternsTab";
import "./Overview.css";


function Overview({ dashboardSelectedChild }) {
    const [period, setPeriod] = useState("day");  // 기본값을 일간으로
    const [activeSubTab, setActiveSubTab] = useState("overview");  // 서브 탭 상태
    const [overviewData, setOverviewData] = useState(null);
    const [aiInsights, setAiInsights] = useState(null);  // AI 인사이트 별도 상태
    const [topics, setTopics] = useState([]);  // Topics 별도 상태
    const [loading, setLoading] = useState();
    const [insightsLoading, setInsightsLoading] = useState(false);  // AI 로딩 상태
    const [psychAnalysis, setPsychAnalysis] = useState(""); // 심리 분석 상태 추가
    const [topicsLoading, setTopicsLoading] = useState(false);  // Topics 로딩 상태

    useEffect(() => {
        if (dashboardSelectedChild) {
            fetchOverviewData();
            fetchAIInsights();  // AI 인사이트 별도 로딩
            fetchTopics();  // Topics 별도 로딩
        }
    }, [dashboardSelectedChild, period]);

    const fetchOverviewData = async () => {
        setLoading(true);
        try {
           const data = await getOverview(dashboardSelectedChild.id, period);
           console.log('📊 Overview API Response:', data);
           console.log('emotions:', data.emotions);
           console.log('choices:', data.choices);
           console.log('topics:', data.topics);
           setOverviewData(data);
        } catch (e) {
            console.error('Overview 데이터 조회 실패:', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAIInsights = async () => {
        setInsightsLoading(true);
        setAiInsights(null);  // 기존 인사이트 초기화
        try {
            const data = await getAIInsights(dashboardSelectedChild.id, period);
            console.log('💡 AI Insights Response:', data);
            setAiInsights(data);
        } catch (e) {
            console.error('AI 인사이트 조회 실패:', e);
            // 실패 시 기본값 설정
            setAiInsights({
                quickInsight: "아이와 함께 동화를 읽으며 성장해보세요!",
                recommendation: {
                    ability: "용기",
                    message: "용기 관련 동화를 함께 읽어보세요."
                }
            });
        } finally {
            setInsightsLoading(false);
        }
    };

    const fetchTopics = async () => {
        setTopicsLoading(true);
        setTopics([]);  // 기존 Topics 초기화
        setPsychAnalysis(""); // 초기화
        try {
            const data = await getTopics(dashboardSelectedChild.id, period);
            console.log('🏷️ Topics Response:', data);

            // 첫 번째 항목이 메타데이터(심리분석)인지 확인
            if (data.length > 0 && data[0].psychologicalAnalysis) {
                setPsychAnalysis(data[0].psychologicalAnalysis);
                setTopics(data.slice(1)); // 나머지가 실제 토픽
            } else {
                setTopics(data);
            }           
        } catch (e) {
            console.error('Topics 조회 실패:', e);
            setTopics([]);
            setPsychAnalysis("");
        } finally {
            setTopicsLoading(false);
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

            {/* 서브 탭 */}
            <div className="sub_tabs">
                <button
                    className={`sub_tab_btn ${activeSubTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('overview')}
                >
                    <span className="tab_icon">📊</span>
                    <span className="tab_label">종합 현황</span>
                </button>
                <button
                    className={`sub_tab_btn ${activeSubTab === 'abilities' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('abilities')}
                >
                    <span className="tab_icon">📈</span>
                    <span className="tab_label">능력 발달</span>
                </button>
                <button
                    className={`sub_tab_btn ${activeSubTab === 'patterns' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('patterns')}
                >
                    <span className="tab_icon">🎯</span>
                    <span className="tab_label">활동 분석</span>
                </button>
            </div>

            {/* 탭 컨텐츠 */}
            <div className="tab_content">
                {activeSubTab === 'overview' && (
                    <OverviewTab
                        data={overviewData}
                        period={period}
                        aiInsights={aiInsights}
                        insightsLoading={insightsLoading}
                    />
                )}
                {activeSubTab === 'abilities' && (
                    <AbilitiesTab
                        data={overviewData}
                        period={period}
                        aiInsights={aiInsights}
                        insightsLoading={insightsLoading}
                    />
                )}
                {activeSubTab === 'patterns' && (
                    <PatternsTab
                        data={overviewData}
                        period={period}
                        topics={topics}
                        topicsLoading={topicsLoading}
                        psychAnalysis={psychAnalysis}
                    />
                )}
            </div>
        </div>
    );
}

export default Overview;