import React, { useContext, useState, useEffect } from "react";
import { RewardContext } from "../../context/RewardContext.jsx";
import { FaStar } from "react-icons/fa";
import { GiDinosaurEgg } from "react-icons/gi";
import "./RewardProgress.css";

function RewardProgress() {
  const { stars, eggs } = useContext(RewardContext);
  const [shine, setShine] = useState(false);

  useEffect(() => {
    if (stars > 0) {
      setShine(true);
      const timer = setTimeout(() => setShine(false), 600);
      return () => clearTimeout(timer);
    }
  }, [stars]);

  return (
    <div className={`reward-bar ${shine ? "shine" : ""}`}>
      <div className="reward-info">
        <span className="icon-star">
          <FaStar /> {stars} / 5
        </span>
        <span className="icon-egg">
          <GiDinosaurEgg /> {eggs}
        </span>
      </div>
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
