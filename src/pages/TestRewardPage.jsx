import React, { useState } from 'react';
import RewardPopup from '../components/reward/RewardPopup';

function TestRewardPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [testReward, setTestReward] = useState({ stars: 1, eggs: 0 });

  const testScenarios = [
    { label: '별 1개 획득', stars: 1, eggs: 0 },
    { label: '별 4개 (거의 달성)', stars: 4, eggs: 0 },
    { label: '별 5개 → 알 획득!', stars: 0, eggs: 1 }, // 5개 모여서 알로 전환
    { label: '알 3개 보유', stars: 2, eggs: 3 },
  ];

  const handleTest = (scenario) => {
    setTestReward({ stars: scenario.stars, eggs: scenario.eggs });
    setShowPopup(true);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>보상 팝업 테스트</h1>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {testScenarios.map((scenario, idx) => (
          <button
            key={idx}
            onClick={() => handleTest(scenario)}
            style={{
              padding: '15px 25px',
              fontSize: '16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <RewardPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        reward={testReward}
      />
    </div>
  );
}

export default TestRewardPage;