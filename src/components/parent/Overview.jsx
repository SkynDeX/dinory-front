import React, { useEffect, useState } from "react";
import { getOverview } from '../../services/api/dashboardApi';
import AbilityRadarChart from "./charts/AbilityRadarChart";
import EmotionLineChart from "./charts/EmotionLineChart";
import ChoicePatternChart from "./charts/ChoicePatternChart";
import TopicCloud from "./charts/TopicCloud";
import "./Overview.css";


function Overview({ dashboardSelectedChild }) {
    const [period, setPeriod] = useState("day");
    const [overviewData, setOverviewData] = useState(null);
    const [loading, setLoading] = useState();

    useEffect(() => {
        if (dashboardSelectedChild) {
            fetchOverviewData();
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
                    <div className="chart_container" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 100 }}>
                        <AbilityRadarChart data={overviewData}/>
                    </div>
                </div>

                {/* 감정 추이 라인 차트 */}
                <div className="chart_card">
                    <h3 className="chart_title">감정 변화 추이</h3>
                    <div className="chart_container">
                        <EmotionLineChart data={overviewData.emotions} period={period} />
                    </div>
                </div>

                {/* 선택 패턴 도넛 차트 */}
                <div className="chart_card">
                    <h3 className="chart_title">선택 패턴 분석</h3>
                    <div className="chart_container">
                        <ChoicePatternChart data={overviewData.choices} />
                    </div>
                </div>

                {/* 관심사 태그 클라우드 */}
                <div className="chart_card">
                    <h3 className="chart_title">대화 주제 분석</h3>
                    <TopicCloud topics={overviewData.topics} />
                </div>
            </div>

        </div>
    );
}

export default Overview;