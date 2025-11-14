import React, { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import "./DinoCharacter.css";
import dinoAnimation from "../../assets/dino.json";
import happyDinoAnimation from "../../assets/happy_dino.json";
import sadDinoAnimation from "../../assets/sad_dino.json";
import angryDinoAnimation from "../../assets/angry_dino.json";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api/authApi";
import { chatApi } from "../../services/api/chatApi";
import { useAuth } from "../../context/AuthContext";

// 메뉴 이미지
import iconDino from "../../assets/icons/dino.png";
import iconLogin from "../../assets/icons/login.png";
import iconLogout from "../../assets/icons/logout.png";
import iconDashboard from "../../assets/icons/dashboard.png";
import iconGirl from "../../assets/icons/girl.png";
import iconHome from "../../assets/icons/home.png";

// ⭐ NEW: 파티클 이미지
// import spark from "../../assets/icons/dino.png";

function DinoCharacter({ isHome }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [choices, setChoices] = useState([]);
  const [isTextInputMode, setIsTextInputMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dinoEmotion, setDinoEmotion] = useState("neutral"); // [2025-11-04 김민중 추가] Dino 감정 상태
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const [guideMessage, setGuideMessge] = useState("");

  // 홈 첫 등장 애니메이션
  const [showDino, setShowDino] = useState(!isHome);
  const [showParticles, setShowParticles] = useState(false);

  // 홈일 때만 2초 후 디노 등장
  useEffect(() => {
    if (isHome) {
    // 2초 후 디노 나타남
    setTimeout(() => {
      setShowDino(true);

      
      setTimeout(() => {
        setIsJumping(true);
        setShowParticles(true);

        setTimeout(() => {
          setGuideMessge("안녕! 나는 디노야!\n나를 눌러봐!");
        }, 600);

        setTimeout(() => setIsJumping(false), 600);
        setTimeout(() => setShowParticles(false), 1200);
      }, 200); 

    }, 2000);
  }
}, [isHome]);


  // 메시지 업데이트 시 스크롤 아래로
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 음성 인식 초기화
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "ko-KR";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("음성 인식 오류:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // [2025-11-04 김민중 추가] 감정에 따라 애니메이션 선택
  const getDinoAnimation = () => {
    switch (dinoEmotion) {
      case "happy":
        return happyDinoAnimation;
      case "sad":
        return sadDinoAnimation;
      case "angry":
        return angryDinoAnimation;
      default:
        return dinoAnimation;
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      logout();
      navigate("/login");
    }
  };

  const handleClick = async () => {
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 600);

    if (isOpen) {
      setIsOpen(false);
      setInputMessage("");
      setIsTextInputMode(false);
      setIsMenuOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);

    try {
      const childId = user?.id || null;
      const response = await chatApi.getOrCreateActiveSession(childId);
      setSessionId(response.sessionId);

      if (response.messages && response.messages.length > 0) {
        // [2025-11-12 추가] [RECOMMEND_STORY] 포함된 메시지와 그 이전 질문 제거
        const filteredMessages = [];
        const rawMessages = response.messages;

        for (let i = 0; i < rawMessages.length; i++) {
          const msg = rawMessages[i];

          // AI 메시지에 [RECOMMEND_STORY]가 있으면 이 메시지와 이전 USER 메시지 건너뛰기
          if (msg.sender === "AI" && msg.message && msg.message.includes('[RECOMMEND_STORY]')) {
            // 바로 이전 메시지가 USER 메시지였다면 제거 (이미 추가된 마지막 메시지)
            if (filteredMessages.length > 0 && filteredMessages[filteredMessages.length - 1].sender === "USER") {
              filteredMessages.pop();
            }
            // 현재 AI 메시지도 건너뛰기
            continue;
          }

          filteredMessages.push({
            sender: msg.sender === "AI" ? "AI" : "USER",
            message: msg.message,
            createdAt: msg.createdAt,
          });
        }

        setMessages(filteredMessages);
      } else {
        setMessages([
          {
            sender: "AI",
            message: "안녕! 나는 디노야! 무엇을 도와줄까?",
            createdAt: new Date(),
          },
        ]);
      }

      setChoices([
        "오늘 기분이 어때?",
        "재미있는 이야기 들려줘",
        "메뉴",
        "직접 입력하기",
      ]);
      setDinoEmotion("neutral");
    } catch (error) {
      console.error("채팅 세션 초기화 실패:", error);
      setMessages([
        {
          sender: "AI",
          message: "안녕! 나는 디노야! (오프라인 모드)",
          createdAt: new Date(),
        },
      ]);
      setChoices([
        "오늘 기분이 어때?",
        "재미있는 이야기 들려줘",
        "놀이 추천해줘",
        "메뉴",
        "직접 입력하기",
      ]);
      setIsMenuOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoiceSelect = async (choice) => {
    if (choice === "직접 입력하기") {
      setIsTextInputMode(true);
      setChoices([]);
      return;
    }

    if (choice === "메뉴") {
      setIsMenuOpen(true);
      return;
    }

    await handleSendMessage(choice);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("음성 인식이 지원되지 않는 브라우저입니다.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("음성 인식 시작 실패:", error);
      }
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const currentMessage = messageText || inputMessage.trim();
    if (!currentMessage || isLoading || !sessionId) return;

    setInputMessage("");
    setIsLoading(true);
    setChoices([]);

    const userMessage = {
      sender: "USER",
      message: currentMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // [2025-11-14 추가] 페이지 이동 의도 분석
      console.log('📡 [DinoCharacter] 페이지 이동 의도 분석 시작:', currentMessage);
      const navIntent = await chatApi.analyzeNavigationIntent(currentMessage);
      console.log('📊 [DinoCharacter] 분석 결과:', navIntent);

      // 백엔드에서 스네이크 케이스로 반환하므로 언더스코어로 접근
      const hasIntent = navIntent.has_navigation_intent || navIntent.hasNavigationIntent;
      const targetPath = navIntent.target_path || navIntent.targetPath;
      const confidence = navIntent.confidence || 0;

      console.log('🔍 [DinoCharacter] 파싱된 값:', { hasIntent, targetPath, confidence });

      if (hasIntent && confidence >= 0.7) {
        console.log('🚀 [DinoCharacter] 페이지 이동 의도 감지! 이동 중...', navIntent);

        // 페이지 이동 안내 메시지 표시
        const navMsg = {
          sender: "AI",
          message: `알겠어요! ${getPageName(targetPath)} 페이지로 이동할게요.`,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, navMsg]);
        setIsLoading(false);
        setIsTextInputMode(false);

        // 1초 후 페이지 이동
        setTimeout(() => {
          navigate(targetPath);
          setIsOpen(false); // 디노 닫기
        }, 1000);

        return;
      }

      console.log('⚠️ [DinoCharacter] 페이지 이동 의도 없음 또는 신뢰도 낮음 (일반 대화 처리)');

      const response = await chatApi.sendMessage(sessionId, currentMessage);
      let aiResponseText = response.aiResponse;

      // [2025-11-12 수정] [RECOMMEND_STORY] 포함되어 있으면 질문+응답 둘 다 숨기기
      if (aiResponseText && aiResponseText.includes('[RECOMMEND_STORY]')) {
        // 방금 추가한 사용자 메시지 제거
        setMessages((prev) => prev.slice(0, -1));
        console.log('[DinoCharacter] [RECOMMEND_STORY] 감지 - 질문과 응답 화면에 표시 안 함');
        // AI 메시지도 추가하지 않고, 선택지만 생성
        await generateChoices(aiResponseText);
        return;
      }

      const aiMessage = {
        sender: "AI",
        message: aiResponseText,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      await generateChoices(aiResponseText);
    } catch (error) {
      console.error("메시지 전송 실패:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "AI",
          message:
            "죄송해요, 지금은 응답하기 어려워요. 잠시 후 다시 시도해주세요!",
          createdAt: new Date(),
        },
      ]);
      setChoices(["다시 시도하기", "다른 질문하기", "메뉴", "직접 입력하기"]);
      setDinoEmotion("neutral");
    } finally {
      setIsLoading(false);
      setIsTextInputMode(false);
    }
  };

  // [2025-11-14 추가] 경로를 한글 이름으로 변환
  const getPageName = (path) => {
    const pageNames = {
      "/home": "홈",
      "/story/list": "동화 목록",
      "/parent/dashboard": "대시보드",
      "/child/select": "자녀 선택",
      "/child/registration": "자녀 등록",
      "/child/emotion": "감정 선택",
      "/child/interest": "관심사 선택",
      "/my-dinos": "내 공룡",
      "/profile": "프로필",
      "/landing": "랜딩",
    };
    return pageNames[path] || path;
  };

  const generateChoices = async (lastMessage) => {
    try {
      const childId = user?.id || null;
      const response = await chatApi.generateChoices(sessionId, childId, lastMessage);
      const dynamicChoices = response.choices || [];
      const fixedChoices = ["메뉴", "직접 입력하기"];
      const allChoices = [...dynamicChoices, ...fixedChoices];
      setChoices(allChoices);
      if (response.emotion) setDinoEmotion(response.emotion);
    } catch (error) {
      console.error("선택지 생성 실패:", error);
      setChoices(["더 알려줘", "다른 이야기", "메뉴", "직접 입력하기"]);
      setDinoEmotion("neutral");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`dino-wrapper ${isHome ? "home-mode" : ""}`}>
      
    {/* NEW: 파티클 */}
    {showParticles && isHome && (
      <div className="dino-particle-wrapper dino-particle-active">
        {[...Array(28)].map((_, idx) => {
        const colors = ["#ffd166", "#ff9b7a", "#87ceeb", "#2fa36b"];
        const color = colors[Math.floor(Math.random() * colors.length)];

      return (
        <div
          key={idx}
          className="particle-item"
          style={{
            backgroundColor: color,
            width: `${Math.random() * 12 + 8}px`,
            height: `${Math.random() * 12 + 8}px`,
            "--x": `${(Math.random() - 0.5) * 250}px`,
            "--y": `${(Math.random() - 0.5) * 250}px`,
            "--duration": `${Math.random() * 0.5 + 0.8}s`,
          }}
        />
      );
    })}
  </div>
)}


      {/* 등장 연출 */}
      {showDino && (
        <div
          className={`dino-container ${isJumping ? "jump" : ""}`}
          onClick={handleClick}
        >
          <Lottie
            animationData={getDinoAnimation()}
            loop
            autoplay
            className="dino-lottie"
            key={dinoEmotion}
          />
        </div>
      )}

      {isOpen && (
        <div className="speech-bubble chat-bubble">
          <div className="chat-header">
            <p className="chat-title">디노와 대화</p>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === "USER" ? "user" : "bot"}`}
              >
                <p>{msg.message}</p>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <p className="typing">입력 중...</p>
              </div>
            )}

            {!isTextInputMode && choices.length > 0 && (
              <div className="choices-inline">
                {choices.map((choice, index) => (
                  <button
                    key={index}
                    className="choice-btn"
                    onClick={() => handleChoiceSelect(choice)}
                    disabled={isLoading}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {isTextInputMode && (
            <div className="chat-input-container">
              <button
                className={`voice-button ${isListening ? "listening" : ""}`}
                onClick={handleVoiceInput}
                title="음성 입력"
              >
                🎤
              </button>
              <input
                type="text"
                className="chat-input"
                placeholder={isListening ? "듣고 있어요..." : "메시지를 입력하세요..."}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isListening}
              />
              <button
                className="send-button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
              >
                전송
              </button>
            </div>
          )}

          {/* 메뉴 모달 */}
          {isMenuOpen && (
            <div className="dino-menu-modal">
              <div className="dino-menu-content">
                <div className="dino-menu-header">
                  <h3>메뉴</h3>
                  <button className="dino-close-btn" onClick={() => setIsMenuOpen(false)}>
                    ✕
                  </button>
                </div>
                <div className="dino-menu-body">
                  {!user && (
                    <button
                      className="dino-menu-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/login");
                      }}
                    >
                      <img src={iconLogin} alt="login" className="dino-menu-icon" />
                      로그인 / 회원가입
                    </button>
                  )}
                  {user && (
                    <>
                      <button
                        className="dino-menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/main");
                        }}
                      >
                        <img src={iconHome} alt="home" className="dino-menu-icon" />
                        홈으로 가기
                      </button>
                      <button
                        className="dino-menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/my-dinos");
                        }}
                      >
                        <img src={iconDino} alt="dino" className="dino-menu-icon" />
                        내 공룡 친구들
                      </button>
                      <button
                        className="dino-menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/child/registration");
                        }}
                      >
                        <img src={iconGirl} alt="child" className="dino-menu-icon" />
                        자녀 등록
                      </button>
                      <button
                        className="dino-menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/parent/dashboard");
                        }}
                      >
                        <img src={iconDashboard} alt="dashboard" className="dino-menu-icon" />
                        대시보드
                      </button>
                      <button
                        className="dino-menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <img src={iconLogout} alt="logout" className="dino-menu-icon" />
                        로그아웃
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 홈에서는 idle bubble 아예 제거 */}
      {!isOpen && !isHome && (
        <div className="speech-bubble idle-bubble bouncey">
          <p>나 눌러봐! </p>
        </div>
      )}
      
    </div>
  );
}

export default DinoCharacter;
