import React, { useContext, useState, useEffect } from "react";
import { RewardContext } from "../components/RewardContext.jsx";
import "./RewardProgress.css";

function RewardProgress() {
  const { stars, eggs } = useContext(RewardContext);
  const [shine, setShine] = useState(false);

  // 별 개수가 변할 때 반짝이는 효과 실행
  useEffect(() => {
    if (stars > 0) {
      setShine(true);
      const timer = setTimeout(() => setShine(false), 600);
      return () => clearTimeout(timer);
    }
  }, [stars]);

  return (
    <div className={`reward-bar ${shine ? "shine" : ""}`}>
      <div className="reward-info">⭐ {stars} / 5 | 🥚 {eggs}</div>
      <div className="bar-container">
        <div
          className="bar-fill"
          style={{ width: `${(stars / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default RewardProgress;
