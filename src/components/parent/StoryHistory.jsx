import react from "react";

function StoryHistory({childId}) {
    return(
        <div>
            <h1>동화 히스토리</h1>
            <p>childId: {childId || "선택된 자녀 없음"}</p>
        </div>
    );
}

export default StoryHistory;