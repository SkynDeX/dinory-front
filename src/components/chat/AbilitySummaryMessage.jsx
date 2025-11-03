import React from 'react';
import './AbilitySummaryMessage.css';

const AbilitySummaryMessage = ({ summary, childName }) => {
  const abilities = [
    { key: 'totalCourage', name: '용기', icon: '💪', color: '#ff6b6b' },
    { key: 'totalEmpathy', name: '공감', icon: '💖', color: '#ff89c0' },
    { key: 'totalCreativity', name: '창의성', icon: '🎨', color: '#a78bfa' },
    { key: 'totalResponsibility', name: '책임감', icon: '⭐', color: '#fbbf24' },
    { key: 'totalFriendship', name: '우정', icon: '🤝', color: '#60d394' }
  ];

  return (
    <div className="ability-summary-message">
      <div className="ability-welcome">
        <div className="dino-avatar">🦕</div>
        <div className="welcome-text">
          <h3>안녕, {childName || '친구'}! 🎉</h3>
          <p>동화가 정말 재미있었어! 너의 멋진 선택들 덕분에<br/>이런 능력치를 얻었어요!</p>
        </div>
      </div>

      <div className="ability-cards">
        {abilities.map((ability) => {
          const value = summary[ability.key] || 0;
          return (
            <div
              key={ability.key}
              className={`ability-card ${value === 0 ? 'zero' : ''}`}
              style={{ '--ability-color': ability.color }}
            >
              <div className="ability-card-icon">{ability.icon}</div>
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

      <div className="ability-footer">
        <p>💬 이제 동화에 대해 이야기 나눠볼까?</p>
      </div>
    </div>
  );
};

export default AbilitySummaryMessage;
