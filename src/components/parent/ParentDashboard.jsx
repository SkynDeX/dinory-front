import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChildSelector from "../child/ChildSelector";
import Overview from "./Overview";
import GrowthReport from "./GrowthReport";
import StoryHistory from "./StoryHistory";
import Settings from "./Settings";
import ChildManagement from "../child/ChildManagement";
import "./ParentDashboard.css";

function ParentDashboard() {

    const [activeTab, setActiveTab] = useState("overview");
    const [selectedChild, setSelectedChild] = useState(null);
    const navigate = useNavigate();

    const handleSelectChild = (child) => {
        setSelectedChild(child);
    }

    const handleGoToChildPage = () => {
        navigate("/main");
    }

    return(
        <div className="parent_dashboard_wrapper">
            {/* 사이드바 */}
            <aside className="dashboard_sidebar">
                <div className="sidebar_header">
                    <h2 className="logo">
                        <span className="green">Din</span>
                        <span className="coral">o</span>
                        <span className="sky">r</span>
                        <span className="yellow">y</span>
                    </h2>
                </div>

                {/* 자녀 선택 */}
                <div className="sidebar_child_selector">
                    <ChildSelector 
                        onSelectChild={handleSelectChild}
                        selectedChildId={selectedChild?.id}
                    />
                </div>

                {/* 네비게이션 */}
                <nav className="sidebar_nav">
                    <button
                        className={`nav_item ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        대시보드
                    </button>
                    
                    <button
                        className={`nav_item ${activeTab === "growth" ? "active" : ""}`}
                        onClick={() => setActiveTab("growth")}
                    >
                        성장 리포트
                    </button>

                    <button
                        className={`nav_item ${activeTab === "history" ? "active" : ""}`}
                        onClick={() => setActiveTab("history")}
                    >
                        동화 히스토리
                    </button>

                    <button
                        className={`nav_item ${activeTab === "children" ? "active" : ""}`}
                        onClick={() => setActiveTab("children")}
                    >
                        자녀 관리
                    </button>

                    <button
                        className={`nav_item ${activeTab === "settings" ? "active" : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        설정
                    </button>
                </nav>
                    <button className="child_page_btn" onClick={handleGoToChildPage}>
                        아이 페이지로 이동
                    </button>
            </aside>

            {/* 메인 콘텐츠 */}
            <main className="dashboard_content">
                {activeTab === "overview" && <Overview childId={selectedChild?.id} />}
                {activeTab === "growth" && <GrowthReport childId={selectedChild?.id} />}
                {activeTab === "history" && <StoryHistory childId={selectedChild?.id} />}
                {activeTab === "children" && <ChildManagement childId={selectedChild?.id} />}
                {activeTab === "settings" && <Settings childId={selectedChild?.id} />}
            </main>
        </div>
    );
}

export default ParentDashboard;