import React, { useState } from 'react';
import {
  generateStory,
  getNextScene,
  saveChoice,
  completeStory,
  getStoryCompletionSummary
} from '../services/api/storyApi';
import { chatApi } from '../services/api/chatApi';
import './StoryFlowTest.css';

const StoryFlowTest = () => {
  const [step, setStep] = useState('init'); // init, reading, completed, chat-started
  const [logs, setLogs] = useState([]);
  const [testData, setTestData] = useState({
    storyId: 'new_sibling',
    childId: 1,
    childName: '지우',
    emotion: '',  // 사용자가 선택하도록 빈 값
    interests: ['가족']
  });
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken') || '');
  const [completionId, setCompletionId] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const handleGenerateStory = async () => {
    if (!authToken) { addLog('❌ 토큰이 없습니다. 로그인 필요', 'error'); return; }
    if (!selectedEmotion) { addLog('❌ 오늘 기분을 선택해주세요', 'error'); return; }

    try {
      setIsLoading(true);
      addLog(`📖 동화 생성 시작... (기분: ${selectedEmotion})`, 'info');

      const res = await generateStory(testData.storyId, {
        childId: testData.childId,
        childName: testData.childName,
        emotion: selectedEmotion,  // 선택한 감정 사용
        interests: testData.interests
      });

      const cid = res.completionId || res.id;
      if (!cid) throw new Error('completionId가 응답에 없습니다');
      setCompletionId(cid);

      const firstScene =
        (res.story && Array.isArray(res.story.scenes) && res.story.scenes[0]) ||
        res.firstScene || res.scene || null;
      if (!firstScene) throw new Error('첫 장면이 응답에 없습니다');

      setScenes([firstScene]);
      setCurrentScene(firstScene);
      setStep('reading');
      addLog(`✅ 동화 시작. completionId=${cid}`, 'success');
    } catch (e) {
      addLog(`❌ 동화 생성 실패: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoose = async (choice) => {
    if (!completionId || !currentScene || isLoading) return; // 로딩 중이면 중복 클릭 방지

    try {
      setIsLoading(true);

      const payload = {
        sceneNumber: currentScene.sceneNumber,
        choiceId: choice.id ?? choice.choiceId,
        choiceText: choice.label || choice.text,
        abilityType: choice.abilityType,
        abilityPoints: choice.abilityPoints ?? choice.abilityScore ?? 0
      };

      // 선택 저장은 선택 사항(호환용)
      try {
        await saveChoice(completionId, payload);
        addLog(`💾 선택 저장: Scene ${payload.sceneNumber} - ${payload.abilityType} +${payload.abilityPoints}`, 'info');
      } catch (err) {
        addLog(`⚠️ 선택 저장 실패: ${err.message}`, 'error');
      }

      const next = await getNextScene(completionId, payload);
      if (!next) throw new Error('다음 장면 응답이 없습니다');

      const nextScene = next.scene || next; // 백엔드 응답형 유연 처리
      setScenes(prev => [...prev, nextScene]);
      setCurrentScene(nextScene);
      addLog(`➡️ Scene ${payload.sceneNumber} → ${nextScene.sceneNumber}`, 'info');

      const isEnd = (!nextScene.choices || nextScene.choices.length === 0) || next.isEnding === true;
      if (isEnd) {
        addLog('🎯 마지막 장면 도달. 완료 처리 진행...', 'info');
        await handleComplete();
      }
    } catch (e) {
      addLog(`❌ 다음 장면 생성 실패: ${e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!completionId) { addLog('❌ CompletionId가 없습니다', 'error'); return; }
    try {
      await completeStory(completionId, { totalTime: scenes.length * 15 });
      const summary = await getStoryCompletionSummary(completionId);
      setSummaryData(summary);
      setStep('completed');
      addLog('✅ 동화 완료 및 요약 수신', 'success');
    } catch (e) {
      addLog(`❌ 동화 완료 실패: ${e.message}`, 'error');
    }
  };

  const handleStartChat = async () => {
    if (!completionId) { addLog('❌ CompletionId가 없습니다', 'error'); return; }
    try {
      addLog('💬 동화 기반 챗봇 세션 시작...', 'info');
      const response = await chatApi.initChatSessionFromStory(completionId);
      setChatSessionId(response.sessionId);
      setChatMessages([{ role: 'assistant', content: response.aiResponse }]);
      setStep('chat-started');
      addLog(`✅ 챗봇 세션 시작: ${response.sessionId}`, 'success');
    } catch (e) {
      addLog(`❌ 챗봇 시작 실패: ${e.message}`, 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!chatSessionId || !userInput.trim()) return;
    try {
      const userMessage = userInput.trim();
      setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setUserInput('');
      addLog(`👤 사용자: ${userMessage}`, 'info');

      const response = await chatApi.sendMessage(chatSessionId, userMessage);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.aiResponse }]);
      addLog(`🤖 AI: ${response.aiResponse}`, 'success');
    } catch (e) {
      addLog(`❌ 메시지 전송 실패: ${e.message}`, 'error');
    }
  };

  const handleReset = () => {
    setStep('init'); setLogs([]); setCompletionId(null);
    setScenes([]); setCurrentScene(null); setSummaryData(null);
    setChatSessionId(null); setChatMessages([]); setUserInput('');
    addLog('🔄 테스트 초기화 완료', 'info');
  };

  return (
    <div className="story-flow-test">
      <div className="test-header">
        <h1>🧪 동화 → 분기형 → 챗봇 테스트</h1>
        <button onClick={handleReset} className="reset-btn">초기화</button>
      </div>

      <div className="test-container">
        {/* 왼쪽 패널 */}
        <div className="test-controls">
          <div className="control-section">
            <h2>🔐 인증</h2>
            <div className="input-group">
              <label>Access Token:</label>
              <input
                value={authToken}
                onChange={(e) => {
                  const token = e.target.value;
                  setAuthToken(token);
                  if (token) {
                    localStorage.setItem('accessToken', token);
                    addLog('✅ 토큰 저장 완료', 'success');
                  }
                }}
                placeholder="로그인 후 자동 입력됨"
                disabled={step !== 'init'}
              />
              {!authToken && (
                <small style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>
                  ⚠️ 로그인이 필요합니다: <a href="/login" style={{ color: '#667eea' }}>로그인 페이지로 이동</a>
                </small>
              )}
            </div>
          </div>

          <div className="control-section">
            <h2>📝 테스트 데이터</h2>
            <div className="input-group">
              <label>Story ID:</label>
              <input
                value={testData.storyId}
                onChange={(e) => setTestData({ ...testData, storyId: e.target.value })}
                disabled={step !== 'init'}
              />
            </div>
            <div className="input-group">
              <label>Child ID:</label>
              <input
                type="number"
                value={testData.childId}
                onChange={(e) => setTestData({ ...testData, childId: parseInt(e.target.value) })}
                disabled={step !== 'init'}
              />
            </div>
            <div className="input-group">
              <label>Child Name:</label>
              <input
                value={testData.childName}
                onChange={(e) => setTestData({ ...testData, childName: e.target.value })}
                disabled={step !== 'init'}
              />
            </div>
          </div>

          <div className="control-section">
            <h2>😊 오늘 기분은 어때요?</h2>
            <div className="emotion-selector">
              {['기뻐요', '슬퍼요', '화나요', '무서워요', '신나요', '피곤해요'].map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setSelectedEmotion(emotion)}
                  className={`emotion-btn ${selectedEmotion === emotion ? 'selected' : ''}`}
                  disabled={step !== 'init'}
                  style={{
                    backgroundColor: selectedEmotion === emotion ? '#667eea' : '#f3f4f6',
                    color: selectedEmotion === emotion ? 'white' : '#374151',
                    border: selectedEmotion === emotion ? '2px solid #5a67d8' : '1px solid #d1d5db',
                    padding: '10px 16px',
                    margin: '4px',
                    borderRadius: '8px',
                    cursor: step === 'init' ? 'pointer' : 'not-allowed',
                    fontWeight: selectedEmotion === emotion ? 'bold' : 'normal'
                  }}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h2>🎬 진행</h2>
            <button
              onClick={handleGenerateStory}
              disabled={step !== 'init' || !authToken}
              className="test-btn"
              title={!authToken ? '로그인이 필요합니다' : ''}
            >
              1. 동화 시작(첫 장면)
            </button>

            <button
              onClick={handleComplete}
              disabled={step !== 'reading'}
              className="test-btn"
            >
              2. 동화 수동 완료
            </button>

            {summaryData && (
              <div className="control-section summary-section">
                <h3>📊 동화 요약</h3>
                <div className="summary-content">
                  <p><strong>제목:</strong> {summaryData.storyTitle}</p>
                  <p><strong>아이:</strong> {summaryData.childName}</p>
                  <p><strong>소요 시간:</strong> {summaryData.totalTime}초</p>
                  <div className="abilities">
                    <h4>능력치</h4>
                    <ul>
                      <li>용기: +{summaryData.totalCourage}</li>
                      <li>공감: +{summaryData.totalEmpathy}</li>
                      <li>창의성: +{summaryData.totalCreativity}</li>
                      <li>책임감: +{summaryData.totalResponsibility}</li>
                      <li>우정: +{summaryData.totalFriendship}</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 중앙: 장면/선택 */}
        <div className="chat-section">
          <h2>📖 현재 장면</h2>
          {currentScene ? (
            <div className="scene">
              <div className="scene-number">Scene {currentScene.sceneNumber}</div>
              <div className="scene-text">{currentScene.text || currentScene.content}</div>

              {isLoading ? (
                <div className="loading">로딩...</div>
              ) : (
                <div className="choices">
                  {(currentScene.choices || []).map((ch) => {
                    const score = ch.abilityPoints ?? ch.abilityScore ?? 0;
                    return (
                      <button
                        key={ch.id ?? ch.choiceId}
                        onClick={() => handleChoose(ch)}
                        className="choice-btn"
                        title={`${ch.abilityType} +${score}`}
                        disabled={isLoading}
                      >
                        {ch.label || ch.text}
                      </button>
                    );
                  })}
                  {(!currentScene.choices || currentScene.choices.length === 0) && (
                    <div className="no-choices">마지막 장면입니다. 완료 버튼을 눌러 요약을 받아보세요.</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="chat-placeholder">시작 버튼을 눌러 첫 장면을 생성하세요</div>
          )}

          {step === 'completed' && (
            <div style={{ marginTop: 16 }}>
              <button onClick={handleStartChat} className="test-btn primary">4. 챗봇 시작 🚀</button>
            </div>
          )}
        </div>

        {/* 오른쪽: 로그 및 챗봇 */}
        <div className="log-section">
          <h2>📋 로그</h2>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index} className={`log-item ${log.type}`}>
                <span className="timestamp">[{log.timestamp}]</span>
                <span className="message">{log.message}</span>
              </div>
            ))}
          </div>

          {step === 'chat-started' && (
            <div className="chat-ui">
              <h3>💬 챗봇 대화</h3>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <div className="message-label">{msg.role === 'user' ? '👤 사용자' : '🤖 디노'}</div>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="메시지를 입력하세요..."
                />
                <button onClick={handleSendMessage}>전송</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryFlowTest;
