import React, { useEffect, useState } from "react";
import { useChild } from "../../context/ChildContext"

function Overview({childId}) {
    const { childrenList } = useChild();
    const [children, setChildren] = useState([]);

    useEffect(() => {
        setChildren(childrenList);
    }, [childrenList]);

    return(
        <div className="overview_wrapper">
            <h1>대시보드</h1>
            <p>childId: {childId || "선택된 자녀 없음"}</p>
        </div>
    );
}

export default Overview;