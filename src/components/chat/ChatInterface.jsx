// /src/components/ChatInterface/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { chatApi } from '../../services/api/chatApi';
import './ChatInterface.css';

const ChatInterface = ({ childId, onComplete }) => {
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
    if (!childId) return;
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
  }, [childId]);

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
      if (sessionId) await chatApi.endChatSession(sessionId);
    } catch (e) {
      console.error('endChatSession 실패:', e);
    }
    onComplete?.(messages);
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
            {messages.map((m, i) => (
              <div
                key={`${m.createdAt}-${i}`}
                className={`message ${m.sender === 'user' ? 'message-user' : 'message-assistant'}`}
              >
                <div className="message-content"><p>{m.content}</p></div>
              </div>
            ))}
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
              🎤
            </button>
            <button
              onClick={handleSend}
              className="send-button"
              disabled={!input.trim() || !sessionId}
              aria-label="전송"
              type="button"
            >
              ➤
            </button>
          </div>
        </div>

        <div className="chat-footer">
          <button onClick={handleComplete} className="complete-button" type="button">
            대화 종료
          </button>
          <p className="chat-hint">Enter 전송 · Shift+Enter 줄바꿈</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
