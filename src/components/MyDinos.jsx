import React, { useContext } from "react";
import { RewardContext } from "../components/RewardContext";
import "./MyDinos.css";

function MyDinos() {
  const { dinos } = useContext(RewardContext);

  return (
    <div className="mydinos-wrapper">
      <h1 className="mydinos-title">내 공룡 친구들</h1>

      {dinos.length === 0 ? (
        <p className="empty-text">아직 태어난 공룡이 없어요...</p>
      ) : (
        <div className="dino-grid">
          {dinos.map((dino, i) => (
            <div
              key={i}
              className="dino-card"
              style={{ background: dino.color }}
            >
              <div className="dino-emoji">🦖</div>
              <div className="dino-name">{dino.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDinos;
