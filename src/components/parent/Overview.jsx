import react from "react";

function Overview({childId}) {
    return(
        <div className="overview_wrapper">
            <h1>대시보드</h1>
            <p>childId: {childId || "선택된 자녀 없음"}</p>
        </div>
    );
}

export default Overview;