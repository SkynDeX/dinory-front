// src/pages/StoryFlowTest.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  generateStory as apiGenerateStory,
  getNextScene as apiGetNextScene,
  saveChoice as apiSaveChoice,
  completeStory as apiCompleteStory,
  getStoryCompletionSummary as apiGetStoryCompletionSummary
} from '../services/api/storyApi';
import axiosInstance from '../services/api/axiosInstance';
import { chatApi } from '../services/api/chatApi';
import './StoryFlowTest.css';

// ====== 작은 유틸 ======
const nowHHmmss = () => new Date().toLocaleTimeString();

const decodeJwt = (token) => {
  try {
    if (!token) return null;
    const payload = token.split('.')[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 2 ? '==' : b64.length % 4 === 3 ? '=' : '';
    const json = JSON.parse(atob(b64 + pad));
    return json; // { sub, email, exp, iat, roles ... }
  } catch {
    return null;
  }
};

const msLeft = (expSec) => {
  if (!expSec) return null;
  const diff = expSec * 1000 - Date.now();
  return diff;
};

const fmtLeft = (ms) => {
  if (ms == null) return '-';
  if (ms <= 0) return '만료됨';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s 남음`;
};

// ====== 본 컴포넌트 ======
const StoryFlowTest = () => {
  const [step, setStep] = useState('init'); // init, reading, completed, chat-started
  const [logs, setLogs] = useState([]);
  const [testData, setTestData] = useState({
    storyId: 'new_sibling',
    childId: 1,
    childName: '지우',
  });
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken') || '');
  const [completionId, setCompletionId] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');

  const addLog = (message, type = 'info', extra = undefined) => {
    const timestamp = nowHHmmss();
    const tag = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
    console[type === 'error' ? 'error' : type === 'success' ? 'log' : type === 'warn' ? 'warn' : 'log'](
      `[SFT ${timestamp}] ${tag} ${message}`,
      extra ?? ''
    );
    setLogs((prev) => [...prev, { timestamp, message: `${tag} ${message}`, type }]);
  };

  // JWT 클레임 & 남은 시간
  const jwtPayload = useMemo(() => decodeJwt(authToken), [authToken]);
  const leftMs = useMemo(() => msLeft(jwtPayload?.exp), [jwtPayload]);

  useEffect(() => {
    addLog('StoryFlowTest mounted');
  }, []);

  // ====== 공통: 401 발생 시 1회 자체 리프레시 후 재시도 ======
  // axios 인터셉터도 리프레시하지만, 혹시 정책/경로 차이로 실패할 수 있어 보조로 둔다.
  const with401Retry = async (fn, descriptionForLog) => {
    try {
      return await fn();
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        addLog(`${descriptionForLog} → 401 감지. 클라이언트 보조 리프레시 시도`, 'warn', e?.response?.data);
        try {
          // 절대 URL 사용 금지. baseURL은 axiosInstance에 이미 설정됨.
          const r = await axiosInstance.post('/api/auth/refresh', {});
          const newAccessToken = r?.data?.accessToken;
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            setAuthToken(newAccessToken);
            axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            addLog('보조 리프레시 성공. 원 요청 1회 재시도', 'success');
            return await fn();
          }
          throw new Error('보조 리프레시 응답에 accessToken 없음');
        } catch (re) {
          addLog('보조 리프레시 실패', 'error', re?.response?.data || re?.message);
          throw e;
        }
      }
      throw e;
    }
  };

  // ====== 동화 시작 ======
  const handleGenerateStory = async () => {
    if (!authToken) { addLog('토큰이 없습니다. 로그인 필요', 'error'); return; }
    if (!selectedEmotion) { addLog('오늘 기분을 선택해주세요', 'error'); return; }
    if (selectedInterests.length === 0) { addLog('관심 주제를 최소 1개 선택해주세요', 'error'); return; }

    const clientRequestId = `gen-${Date.now()}`;
    addLog(`[GEN] 동화 생성 시작 (storyId=${testData.storyId}, childId=${testData.childId})`);
    addLog(`[GEN] emotion=${selectedEmotion}, interests=${selectedInterests.join(', ')}`);
    addLog(`[GEN] clientRequestId=${clientRequestId}`);

    setIsLoading(true);
    try {
      const caller = async () => {
        const res = await apiGenerateStory(testData.storyId, {
          childId: testData.childId,
          childName: testData.childName,
          emotion: selectedEmotion,
          interests: selectedInterests,
          clientRequestId,
        });
        return res;
      };

      const res = await with401Retry(caller, '[GEN] generateStory');
      const cid = res?.completionId || res?.id;
      if (!cid) throw new Error('completionId가 응답에 없습니다');
      setCompletionId(cid);

      const firstScene =
        (res?.story && Array.isArray(res.story.scenes) && res.story.scenes[0]) ||
        res?.firstScene || res?.scene || null;

      if (!firstScene) throw new Error('첫 장면이 응답에 없습니다');

      setScenes([firstScene]);
      setCurrentScene(firstScene);
      setStep('reading');

      addLog(`[GEN] 성공: completionId=${cid}`, 'success');
      addLog(`[GEN] 첫 장면 = #${firstScene.sceneNumber} / choices=${(firstScene.choices || []).length}`, 'success');
    } catch (e) {
      const status = e?.response?.status;
      addLog(`[GEN] 실패 status=${status || 'n/a'}`, 'error', e?.response?.data || e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ====== 선택/다음 장면 ======
  const handleChoose = async (choice) => {
    if (!completionId || !currentScene || isLoading) return;

    const payload = {
      sceneNumber: currentScene.sceneNumber,
      choiceId: choice.id ?? choice.choiceId,
      choiceText: choice.label || choice.text,
      abilityType: choice.abilityType,
      abilityPoints: choice.abilityPoints ?? choice.abilityScore ?? 0,
      clientRequestId: `choose-${Date.now()}`
    };

    addLog(`[NEXT] 선택 저장 요청: scene=${payload.sceneNumber}, "${payload.choiceText}" (+${payload.abilityPoints} ${payload.abilityType || ''})`);

    setIsLoading(true);
    try {
      try {
        await with401Retry(
          () => apiSaveChoice(completionId, payload),
          '[NEXT] saveChoice'
        );
        addLog('[NEXT] 선택 저장 성공', 'success');
      } catch (se) {
        addLog('[NEXT] 선택 저장 실패(무시하고 계속 진행)', 'warn', se?.response?.data || se?.message);
      }

      const next = await with401Retry(
        () => apiGetNextScene(completionId, payload),
        '[NEXT] getNextScene'
      );

      if (!next) throw new Error('다음 장면 응답이 없습니다');
      const nextScene = next.scene || next;

      setScenes((prev) => [...prev, nextScene]);
      setCurrentScene(nextScene);
      addLog(`[NEXT] Scene ${payload.sceneNumber} → ${nextScene.sceneNumber}`, 'success');

      const isEnd = (!nextScene.choices || nextScene.choices.length === 0) || next.isEnding === true;
      if (isEnd) {
        addLog('[NEXT] 마지막 장면 도달. 완료 처리', 'warn');
        await handleComplete();
      }
    } catch (e) {
      addLog('[NEXT] 다음 장면 생성 실패', 'error', e?.response?.data || e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ====== 완료 & 요약 ======
  const handleComplete = async () => {
    if (!completionId) { addLog('CompletionId가 없습니다', 'error'); return; }
    setIsLoading(true);
    try {
      await with401Retry(
        () => apiCompleteStory(completionId, { totalTime: scenes.length * 15, clientRequestId: `complete-${Date.now()}` }),
        '[CMP] completeStory'
      );
      const summary = await with401Retry(
        () => apiGetStoryCompletionSummary(completionId),
        '[CMP] getStoryCompletionSummary'
      );
      setSummaryData(summary);
      setStep('completed');
      addLog('[CMP] 완료/요약 수신 성공', 'success', summary);
    } catch (e) {
      addLog('[CMP] 완료 처리 실패', 'error', e?.response?.data || e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ====== 챗봇 ======
  const handleStartChat = async () => {
    if (!completionId) { addLog('CompletionId가 없습니다', 'error'); return; }
    setIsLoading(true);
    try {
      addLog('[CHAT] 세션 시작 요청', 'info');
      const response = await chatApi.initChatSessionFromStory(completionId);
      setChatSessionId(response.sessionId);
      setChatMessages([{ role: 'assistant', content: response.aiResponse }]);
      setStep('chat-started');
      addLog(`[CHAT] 시작 성공: ${response.sessionId}`, 'success');
    } catch (e) {
      addLog('[CHAT] 시작 실패', 'error', e?.response?.data || e?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatSessionId || !userInput.trim()) return;
    try {
      const userMessage = userInput.trim();
      setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
      setUserInput('');
      addLog(`[CHAT] 사용자: ${userMessage}`, 'info');

      const response = await chatApi.sendMessage(chatSessionId, userMessage);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: response.aiResponse }]);
      addLog('[CHAT] AI 응답 수신', 'success');
    } catch (e) {
      addLog('[CHAT] 전송 실패', 'error', e?.response?.data || e?.message);
    }
  };

  // ====== 강제 리셋/리프레시 ======
  const handleReset = () => {
    setStep('init');
    setLogs([]);
    setCompletionId(null);
    setScenes([]);
    setCurrentScene(null);
    setSummaryData(null);
    setChatSessionId(null);
    setChatMessages([]);
    setUserInput('');
    addLog('테스트 초기화 완료');
  };

  const handleForceRefresh = async () => {
    try {
      addLog('[AUTH] 토큰 강제 갱신 시도', 'warn');
      // 절대 URL 사용 금지
      const r = await axiosInstance.post('/api/auth/refresh', {});
      const newToken = r?.data?.accessToken;
      if (!newToken) throw new Error('accessToken 없음');
      localStorage.setItem('accessToken', newToken);
      setAuthToken(newToken);
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      addLog('[AUTH] 토큰 강제 갱신 성공', 'success', { head: newToken.slice(0, 20) + '...' });
    } catch (e) {
      addLog('[AUTH] 토큰 강제 갱신 실패', 'error', e?.response?.data || e?.message);
    }
  };

  return (
    <div className="story-flow-test">
      <div className="test-header">
        <h1>🧪 동화 → 분기형 → 챗봇 테스트</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleForceRefresh} className="reset-btn">토큰 강제 갱신</button>
          <button onClick={handleReset} className="reset-btn">초기화</button>
        </div>
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
                    addLog('[AUTH] 토큰 저장 완료', 'success');
                  } else {
                    localStorage.removeItem('accessToken');
                  }
                }}
                placeholder="로그인 후 자동 입력됨"
                disabled={step !== 'init'}
              />
              <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>
                <div>sub/email: <b>{jwtPayload?.email || jwtPayload?.sub || '-'}</b></div>
                <div>roles: <b>{Array.isArray(jwtPayload?.roles) ? jwtPayload.roles.join(', ') : (jwtPayload?.roles || '-')}</b></div>
                <div>만료: <b>{fmtLeft(leftMs)}</b> (exp: {jwtPayload?.exp ?? '-'})</div>
              </div>
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
                onChange={(e) => setTestData({ ...testData, childId: parseInt(e.target.value || '0', 10) })}
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
            <h2>🎨 어떤 이야기가 좋아요? (여러 개 선택 가능)</h2>
            <div className="interests-selector">
              {[
                { key: '공룡', emoji: '🦕' },
                { key: '동물', emoji: '🐶' },
                { key: '탈것', emoji: '🚗' },
                { key: '우주', emoji: '🚀' },
                { key: '바다', emoji: '🌊' },
                { key: '요정', emoji: '🧚' },
                { key: '친구', emoji: '👫' },
                { key: '로봇', emoji: '🤖' }
              ].map((interest) => {
                const isSelected = selectedInterests.includes(interest.key);
                return (
                  <button
                    key={interest.key}
                    onClick={() => {
                      if (isSelected) setSelectedInterests(selectedInterests.filter(i => i !== interest.key));
                      else setSelectedInterests([...selectedInterests, interest.key]);
                    }}
                    disabled={step !== 'init'}
                    style={{
                      backgroundColor: isSelected ? '#10b981' : '#f3f4f6',
                      color: isSelected ? 'white' : '#374151',
                      border: isSelected ? '2px solid #059669' : '1px solid #d1d5db',
                      padding: '12px 20px',
                      margin: '6px',
                      borderRadius: '12px',
                      cursor: step === 'init' ? 'pointer' : 'not-allowed',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{interest.emoji}</span>
                    <span>{interest.key}</span>
                  </button>
                );
              })}
            </div>
            {selectedInterests.length > 0 && (
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#059669' }}>
                ✓ {selectedInterests.length}개 선택됨: {selectedInterests.join(', ')}
              </div>
            )}
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
                        key={ch.id ?? ch.choiceId ?? (ch.label || ch.text)}
                        onClick={() => handleChoose(ch)}
                        className="choice-btn"
                        title={`${ch.abilityType || ''} +${score}`}
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
