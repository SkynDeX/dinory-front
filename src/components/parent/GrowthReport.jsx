import react from "react";

function GrowthReport({childId}) {
    return(
        <div className="growth_report_wrapper">
            <h1>성장 리포트</h1>
            <p>childId: {childId || "선택된 자녀 없음"}</p>
        </div>
    );
}

export default GrowthReport;