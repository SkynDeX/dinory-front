import React, { useState } from 'react';
import { generateStory, saveChoice, completeStory, getStoryCompletionSummary } from '../services/api/storyApi';
import { chatApi } from '../services/api/chatApi';
import './StoryFlowTest.css';

const StoryFlowTest = () => {
    const [step, setStep] = useState('init'); // init, story-generated, story-completed, chat-started
    const [logs, setLogs] = useState([]);

    // 테스트 데이터
    const [testData, setTestData] = useState({
        storyId: 'new_sibling',
        childId: 1,
        childName: '지우',
        emotion: '화남',
        interests: ['가족']
    });

    // 인증 토큰
    const [authToken, setAuthToken] = useState(localStorage.getItem('accessToken') || '');

    // 응답 데이터
    const [storyData, setStoryData] = useState(null);
    const [completionId, setCompletionId] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [chatSessionId, setChatSessionId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [userInput, setUserInput] = useState('');

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
    };

    // 1. 동화 생성
    const handleGenerateStory = async () => {
        try {
            addLog('📖 동화 생성 시작...', 'info');

            const response = await generateStory(testData.storyId, {
                childId: testData.childId,
                childName: testData.childName,
                emotion: testData.emotion,
                interests: testData.interests
            });

            // 응답 전체 로깅
            addLog(`📦 응답 데이터: ${JSON.stringify(response)}`, 'info');

            setStoryData(response);

            // completionId가 있으면 설정, 없으면 경고
            if (response.completionId) {
                setCompletionId(response.completionId);
                addLog(`✅ 동화 생성 완료! CompletionId: ${response.completionId}`, 'success');
            } else {
                addLog(`⚠️ 동화 생성 완료했지만 CompletionId가 없습니다`, 'error');
                addLog('💡 CompletionId를 수동으로 입력하세요', 'info');
            }

            addLog(`동화 제목: ${response.story?.title || response.title || '테스트 동화'}`, 'info');
            setStep('story-generated');
        } catch (error) {
            addLog(`❌ 동화 생성 실패: ${error.message}`, 'error');
        }
    };

    // 2. 선택지 저장 (테스트용)
    const handleSaveChoices = async () => {
        if (!completionId) {
            addLog('❌ CompletionId가 없습니다', 'error');
            return;
        }

        try {
            addLog('💾 선택지 저장 시작...', 'info');

            // 테스트 선택지들
            const choices = [
                { sceneNumber: 3, choiceId: 1, abilityType: 'empathy', abilityPoints: 10 },
                { sceneNumber: 5, choiceId: 2, abilityType: 'responsibility', abilityPoints: 15 },
                { sceneNumber: 7, choiceId: 3, abilityType: 'friendship', abilityPoints: 10 }
            ];

            for (const choice of choices) {
                await saveChoice(completionId, choice);
                addLog(`선택지 저장: Scene ${choice.sceneNumber} - ${choice.abilityType} +${choice.abilityPoints}`, 'info');
            }

            addLog('✅ 모든 선택지 저장 완료', 'success');
        } catch (error) {
            addLog(`❌ 선택지 저장 실패: ${error.message}`, 'error');
        }
    };

    // 3. 동화 완료
    const handleCompleteStory = async () => {
        if (!completionId) {
            addLog('❌ CompletionId가 없습니다', 'error');
            return;
        }

        try {
            addLog('🎯 동화 완료 처리 시작...', 'info');

            await completeStory(completionId, {
                totalTime: 120
            });

            addLog('✅ 동화 완료!', 'success');
            setStep('story-completed');

            // 동화 요약 조회
            const summary = await getStoryCompletionSummary(completionId);
            setSummaryData(summary);
            addLog('📊 동화 요약 조회 완료', 'info');
            addLog(`능력치: 용기 ${summary.totalCourage}, 공감 ${summary.totalEmpathy}, 창의성 ${summary.totalCreativity}, 책임감 ${summary.totalResponsibility}, 우정 ${summary.totalFriendship}`, 'info');

        } catch (error) {
            addLog(`❌ 동화 완료 실패: ${error.message}`, 'error');
        }
    };

    // 4. 동화 기반 챗봇 시작
    const handleStartChat = async () => {
        if (!completionId) {
            addLog('❌ CompletionId가 없습니다', 'error');
            return;
        }

        try {
            addLog('💬 동화 기반 챗봇 세션 시작...', 'info');

            const response = await chatApi.initChatSessionFromStory(completionId);

            setChatSessionId(response.sessionId);
            setChatMessages([{
                role: 'assistant',
                content: response.aiResponse
            }]);

            addLog(`✅ 챗봇 세션 시작! SessionId: ${response.sessionId}`, 'success');
            addLog(`AI 첫 메시지: "${response.aiResponse}"`, 'info');
            setStep('chat-started');

        } catch (error) {
            addLog(`❌ 챗봇 시작 실패: ${error.message}`, 'error');
        }
    };

    // 5. 챗봇 메시지 전송
    const handleSendMessage = async () => {
        if (!chatSessionId || !userInput.trim()) {
            return;
        }

        try {
            const userMessage = userInput.trim();

            // 사용자 메시지 추가
            setChatMessages(prev => [...prev, {
                role: 'user',
                content: userMessage
            }]);
            setUserInput('');

            addLog(`👤 사용자: ${userMessage}`, 'info');

            // AI 응답 요청
            const response = await chatApi.sendMessage(chatSessionId, userMessage);

            // AI 응답 추가
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: response.aiResponse
            }]);

            addLog(`🤖 AI: ${response.aiResponse}`, 'success');

        } catch (error) {
            addLog(`❌ 메시지 전송 실패: ${error.message}`, 'error');
        }
    };

    // 초기화
    const handleReset = () => {
        setStep('init');
        setLogs([]);
        setStoryData(null);
        setCompletionId(null);
        setSummaryData(null);
        setChatSessionId(null);
        setChatMessages([]);
        setUserInput('');
        addLog('🔄 테스트 초기화 완료', 'info');
    };

    return (
        <div className="story-flow-test">
            <div className="test-header">
                <h1>🧪 동화 → 챗봇 플로우 테스트</h1>
                <button onClick={handleReset} className="reset-btn">초기화</button>
            </div>

            <div className="test-container">
                {/* 왼쪽: 테스트 컨트롤 */}
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
                                <small style={{color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block'}}>
                                    ⚠️ 로그인이 필요합니다: <a href="/login" style={{color: '#667eea'}}>로그인 페이지로 이동</a>
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
                                onChange={(e) => setTestData({...testData, storyId: e.target.value})}
                                disabled={step !== 'init'}
                            />
                        </div>
                        <div className="input-group">
                            <label>Child ID:</label>
                            <input
                                type="number"
                                value={testData.childId}
                                onChange={(e) => setTestData({...testData, childId: parseInt(e.target.value)})}
                                disabled={step !== 'init'}
                            />
                        </div>
                        <div className="input-group">
                            <label>Child Name:</label>
                            <input
                                value={testData.childName}
                                onChange={(e) => setTestData({...testData, childName: e.target.value})}
                                disabled={step !== 'init'}
                            />
                        </div>
                        {step !== 'init' && (
                            <div className="input-group">
                                <label>Completion ID (수동 입력):</label>
                                <input
                                    type="number"
                                    value={completionId || ''}
                                    onChange={(e) => {
                                        const id = parseInt(e.target.value);
                                        if (!isNaN(id)) {
                                            setCompletionId(id);
                                            addLog(`✏️ CompletionId 수동 설정: ${id}`, 'info');
                                        }
                                    }}
                                    placeholder="응답에 없으면 수동 입력"
                                />
                            </div>
                        )}
                    </div>

                    <div className="control-section">
                        <h2>🎬 테스트 단계</h2>

                        <button
                            onClick={handleGenerateStory}
                            disabled={step !== 'init' || !authToken}
                            className="test-btn"
                            title={!authToken ? '로그인이 필요합니다' : ''}
                        >
                            1. 동화 생성
                        </button>

                        <button
                            onClick={handleSaveChoices}
                            disabled={step !== 'story-generated'}
                            className="test-btn"
                        >
                            2. 선택지 저장 (테스트)
                        </button>

                        <button
                            onClick={handleCompleteStory}
                            disabled={step !== 'story-generated'}
                            className="test-btn"
                        >
                            3. 동화 완료
                        </button>

                        <button
                            onClick={handleStartChat}
                            disabled={step !== 'story-completed'}
                            className="test-btn primary"
                        >
                            4. 챗봇 시작 🚀
                        </button>
                    </div>

                    {/* 동화 요약 정보 */}
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

                {/* 중앙: 챗봇 */}
                <div className="chat-section">
                    <h2>💬 챗봇 대화</h2>

                    {step === 'chat-started' ? (
                        <>
                            <div className="chat-messages">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`message ${msg.role}`}>
                                        <div className="message-label">
                                            {msg.role === 'user' ? '👤 사용자' : '🤖 디노'}
                                        </div>
                                        <div className="message-content">
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="chat-input-area">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="메시지를 입력하세요..."
                                />
                                <button onClick={handleSendMessage}>전송</button>
                            </div>
                        </>
                    ) : (
                        <div className="chat-placeholder">
                            <p>챗봇을 시작하려면 먼저 동화를 완료하세요</p>
                        </div>
                    )}
                </div>

                {/* 오른쪽: 로그 */}
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
                </div>
            </div>
        </div>
    );
};

export default StoryFlowTest;