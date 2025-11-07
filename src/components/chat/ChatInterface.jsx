// /src/components/ChatInterface/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { chatApi } from '../../services/api/chatApi';
import { getStoryCompletionSummary, getRecommendedStories } from '../../services/api/storyApi';
import AbilitySummaryMessage from './AbilitySummaryMessage';
import StoryRecommendationMessage from './StoryRecommendationMessage';
import './ChatInterface.css';

// 채팅 아이콘
import micIcon from '../../assets/icons/mike.png';
import sendIcon from '../../assets/icons/send.png';

const ChatInterface = ({ childId, initialSessionId, completionId, onComplete }) => {  // [2025-10-29 김광현] initialSessionId, completionId 추가
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // 스크롤 하단 고정
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // 세션 초기화
  useEffect(() => {
    console.log("=== ChatInterface useEffect 실행 ===");
    console.log("initialSessionId:", initialSessionId);
    console.log("completionId:", completionId);
    console.log("childId:", childId);

    // [2025-10-29 김광현] sessionId가 있으면 기존 세션 로드
    if(initialSessionId) {
      console.log("→ 기존 세션 로드 경로");
      loadExistingSession(initialSessionId);
      return;
    }

    // completionId가 있으면 동화 기반 세션 생성
    if(completionId) {
      console.log("→ 동화 기반 세션 생성 경로");
      initChatSessionFromStory(completionId);
      return;
    }

    if (!childId) {
      console.log("→ childId 없음, 초기화 안 함");
      return;
    }

    console.log("→ 일반 세션 초기화 경로");
    let cancelled = false;

    (async () => {
      try {
        const res = await chatApi.initChatSession(childId);
        if (cancelled) return;
        setSessionId(res.sessionId);

        if (Array.isArray(res.messages) && res.messages.length > 0) {
          setMessages(res.messages.map(m => ({
            sender: m.sender,
            content: m.message ?? m.content ?? '',
            createdAt: m.createdAt ?? new Date().toISOString(),
          })));
        } else {
          setMessages([{
            sender: 'assistant',
            content: '안녕하세요. 무엇을 도와드릴까요?',
            createdAt: new Date().toISOString(),
          }]);
        }
      } catch (e) {
        console.error('initChatSession 실패:', e);
        setMessages([{
          sender: 'assistant',
          content: '초기화에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          createdAt: new Date().toISOString(),
        }]);
      }
    })();

    return () => { cancelled = true; };
  }, [childId, initialSessionId, completionId]); // [2025-10-29 김광현] initialSessionId, completionId 추가
  
  // [2025-10-29 김광현] 기존 세션 로드 함수 추가
  const loadExistingSession = async (sessionIdToLoad) => {
    try {
      console.log("기존 채팅 세션 로드: ", sessionIdToLoad);
      const res = await chatApi.getChatSession(sessionIdToLoad);

      setSessionId(sessionIdToLoad);

      if(Array.isArray(res.messages) && res.messages.length > 0) {
        setMessages(res.messages.map(m => ({
          sender: m.sender === "AI" ? 'assistant' : 'user',
          content: m.message ?? m.content ?? '',
          createdAt: m.createdAt ?? new Date().toISOString(),
        })));

        console.log("세션 로드 완료: ", res);
      }
    } catch (error) {
      console.error("세션 로드 실패:", error);
      setMessages([{
        sender: 'assistant',
        content: '세션을 불러오는데 실패!',
        createdAt: new Date().toISOString(),
      }]);
    }
  }

  // 동화 완료 후 챗봇 세션 초기화
  const initChatSessionFromStory = async (completionIdToUse) => {
    try {
      console.log("★★★ 동화 기반 채팅 세션 시작: completionId=", completionIdToUse);
      console.log("★★★ initChatSessionFromStory 호출!");

      const summary = await getStoryCompletionSummary(completionIdToUse);
      console.log("동화 요약 데이터:", summary);

      const res = await chatApi.initChatSessionFromStory(completionIdToUse);
      setSessionId(res.sessionId);

      const messagesArray = [];

      messagesArray.push({
        sender: 'assistant',
        type: 'ability-summary',
        summary: summary,
        childName: summary.childName || '친구',
        createdAt: new Date().toISOString(),
      });

      if (res.aiResponse && res.aiResponse.trim()) {
        messagesArray.push({
          sender: 'assistant',
          content: res.aiResponse,
          createdAt: new Date().toISOString(),
        });
      }

      setMessages(messagesArray);
      console.log("동화 기반 세션 생성 완료:", res);
    } catch (error) {
      console.error("동화 기반 세션 생성 실패:", error);
      setMessages([{
        sender: 'assistant',
        content: '채팅 세션을 시작하는데 실패했습니다.',
        createdAt: new Date().toISOString(),
      }]);
    }
  }

  // 음성 인식 설정
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'ko-KR';

    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      setInput(transcript);
      setIsRecording(false);
    };
    rec.onerror = () => { setIsRecording(false); };
    rec.onend = () => { setIsRecording(false); };

    recognitionRef.current = rec;

    return () => {
      try { rec.stop(); } catch {}
      recognitionRef.current = null;
    };
  }, []);

  // [2025-11-04 김민중 수정] 동화 추천 키워드 감지 및 자동 추천
  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;

    const text = input.trim();
    setInput('');

    const userMsg = { sender: 'user', content: text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await chatApi.sendMessage(sessionId, text);
      const aiText = res?.aiResponse ?? res?.message ?? '답변을 생성하지 못했습니다.';
      const aiMsg = { sender: 'assistant', content: aiText, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);

      const recommendKeywords = ['동화 추천', '추천해줘', '추천해', '동화 알려', '다른 동화', '새로운 동화'];
      const hasRecommendKeyword = recommendKeywords.some(keyword => text.includes(keyword));

      if (hasRecommendKeyword) {
        console.log('[ChatInterface] 동화 추천 키워드 감지! 자동 추천 시작');
        await handleRequestRecommendation();
      }
    } catch (e) {
      console.error('sendMessage 실패:', e);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        content: '메시지 전송에 실패했습니다. 네트워크 상태를 확인해 주세요.',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceRecording = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert('이 브라우저에서는 음성 입력을 지원하지 않습니다.');
      return;
    }
    if (isRecording) {
      try { rec.stop(); } catch {}
      setIsRecording(false);
    } else {
      try {
        rec.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleComplete = async () => {
    try {
      if (sessionId) {
        await chatApi.endChatSession(sessionId);
        console.log('✅ 채팅 세션 종료:', sessionId);
      }
      window.location.href = '/main';
    } catch (e) {
      console.error('endChatSession 실패:', e);
      window.location.href = '/';
    }
  };

  const handleRequestRecommendation = async () => {
    try {
      console.log('[ChatInterface] 동화 추천 요청');
      setIsTyping(true);
      const recommendations = await getRecommendedStories(null, null, childId, 3);
      console.log('[ChatInterface] 추천 결과:', recommendations);

      const recommendationMsg = {
        sender: 'assistant',
        type: 'story-recommendation',
        recommendations: recommendations,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, recommendationMsg]);
    } catch (error) {
      console.error('[ChatInterface] 추천 요청 실패:', error);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        content: '추천 동화를 불러오는데 실패했습니다.',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-container">
        <div className="chat-header">
          <h2>AI 채팅</h2>
          <p>궁금한 것을 편하게 물어보세요.</p>
        </div>

        <div className="chat-messages-container">
          <div className="chat-messages">
            {messages.map((m, i) => {
              if (m.type === 'ability-summary') {
                return (
                  <div key={`${m.createdAt}-${i}`} className="message message-assistant message-special">
                    <AbilitySummaryMessage summary={m.summary} childName={m.childName} />
                  </div>
                );
              }

              if (m.type === 'story-recommendation') {
                return (
                  <div key={`${m.createdAt}-${i}`} className="message message-assistant message-special">
                    <StoryRecommendationMessage recommendations={m.recommendations} />
                  </div>
                );
              }

              return (
                <div key={`${m.createdAt}-${i}`} className={`message ${m.sender === 'user' ? 'message-user' : 'message-assistant'}`}>
                  <div className="message-content"><p>{m.content}</p></div>
                </div>
              );
            })}
            {isTyping && (
              <div className="message message-assistant">
                <div className="message-content typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하고 Enter를 눌러 전송"
              className="chat-input"
              disabled={!sessionId}
            />
            <button
              onClick={toggleVoiceRecording}
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              disabled={!sessionId}
              title="음성 입력"
              aria-label="음성 입력"
              type="button"
            >
              <img src={micIcon} alt="mic icon" />
            </button>
            <button
              onClick={handleSend}
              className="send-button"
              disabled={!input.trim() || !sessionId}
              aria-label="전송"
              type="button"
            >
              <img src={sendIcon} alt="send icon" />
            </button>
          </div>
        </div>

        <div className="chat-footer">
          <div className="footer-buttons">
            <button onClick={handleComplete} className="complete-button" type="button">
              대화 종료
            </button>
          </div>
          <p className="chat-hint">Enter 전송 · Shift+Enter 줄바꿈 · "동화 추천해줘"로 추천받기</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
