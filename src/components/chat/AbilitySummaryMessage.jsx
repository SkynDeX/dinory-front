import React from 'react';
import './AbilitySummaryMessage.css';

// [공룡 이미지 추가]
import dinoBrave from "../../assets/icons/dino-brave.png";
import dinoEmpathy from "../../assets/icons/dino-empathy.png";
import dinoCreativity from "../../assets/icons/dino-creativity.png";
import dinoResponsibility from "../../assets/icons/dino-responsibility.png";
import dinoFriends from "../../assets/icons/dino-friends.png";
import babyDino from "../../assets/icons/baby-dinosaurs.png";

const AbilitySummaryMessage = ({ summary, childName }) => {
  const abilities = [
    { key: 'totalCourage', 
      name: '용기', 
      icon: dinoBrave, 
      color: '#ff9b7a' },

    { key: 'totalEmpathy', 
      name: '공감', icon: dinoEmpathy, 
      color: '#ff7eb9' },

    { key: 'totalCreativity', 
      name: '창의성', icon: dinoCreativity, 
      color: '#87ceeb' },

    { key: 'totalResponsibility', 
      name: '책임감', icon: dinoResponsibility, 
      color: '#ffd166' },

    { key: 'totalFriendship', 
      name: '우정', icon: dinoFriends, 
      color: '#2fa36b' }
  ];

  return (
    <div className="ability-summary-message">
      {/* 상단 공룡 인사 영역 */}
      <div className="ability-welcome">
          <div className="dino-avatar bounce-in">
          <img src={babyDino} alt="dino" />
        </div>
        <div className="welcome-text">
          <h3>와, {childName || '친구'}! 모험을 완수했어!</h3>
          <p>
            네가 보여준 용기와 마음 덕분에<br />
            새로운 능력치가 깨어났어!
          </p>
        </div>
      </div>

      {/* 능력치 카드들 */}
      <div className="ability-cards">
        {abilities.map((ability) => {
          const value = summary[ability.key] || 0;
          return (
            <div
              key={ability.key}
              className={`ability-card ${value === 0 ? 'zero' : ''}`}
              style={{ '--ability-color': ability.color }}
            >
              <div className="ability-card-icon">
                <img src={ability.icon} alt={ability.name} />
              </div>
              <div className="ability-card-name">{ability.name}</div>
              <div className="ability-card-value">+{value}</div>
              <div className="ability-card-bar">
                <div
                  className="ability-card-bar-fill"
                  style={{ width: `${Math.min(value * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div className="ability-footer">
        <p>이제 디노와 함께 이야기 나눠볼까?</p>
      </div>
    </div>
  );
};

export default AbilitySummaryMessage;
