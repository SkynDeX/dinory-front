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

function DinoCharacter() {
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

    // [2025-11-07 수정] 이미 열려있으면 닫기 (대화 기록은 유지)
    if (isOpen) {
      setIsOpen(false);
      // 세션은 종료하지 않음 - 다음에 열 때 계속 이어서 대화
      // setMessages([]) 삭제 - 대화 기록 유지
      setInputMessage("");
      setIsTextInputMode(false);
      setIsMenuOpen(false);
      return;
    }

    // [2025-11-07 수정] 공룡 클릭 시 활성 세션 조회 또는 생성
    setIsOpen(true);
    setIsLoading(true);

    try {
      const childId = user?.id || null;

      // 활성 세션 조회/생성 (과거 대화 내역 포함)
      const response = await chatApi.getOrCreateActiveSession(childId);
      setSessionId(response.sessionId);

      // 과거 대화 내역이 있으면 표시
      if (response.messages && response.messages.length > 0) {
        console.log(`✅ 기존 대화 ${response.messages.length}개 불러오기`);
        setMessages(
          response.messages.map((msg) => ({
            sender: msg.sender === "AI" ? "AI" : "USER",
            message: msg.message,
            createdAt: msg.createdAt,
          }))
        );
      } else {
        // 새로운 세션 - 초기 인사
        console.log("🆕 새로운 세션 시작");
        setMessages([
          {
            sender: "AI",
            message: "안녕! 나는 디노야! 무엇을 도와줄까?",
            createdAt: new Date(),
          },
        ]);
      }

      // 초기 선택지
      setChoices([
        "오늘 기분이 어때?",
        "재미있는 이야기 들려줘",
        "메뉴",
        "직접 입력하기",
      ]);
      setDinoEmotion("neutral");
    } catch (error) {
      console.error("채팅 세션 초기화 실패:", error);

      // 오프라인 모드
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
      const response = await chatApi.sendMessage(sessionId, currentMessage);

      const aiMessage = {
        sender: "AI",
        message: response.aiResponse,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // [2025-11-04 김민중 수정] AI 기반 동적 선택지 생성 (await 추가)
      await generateChoices(response.aiResponse);
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
      setDinoEmotion("neutral"); // [2025-11-04 김민중 추가] 에러 시 감정 초기화
    } finally {
      setIsLoading(false);
      setIsTextInputMode(false);
    }
  };

  // [2025-11-04 김민중 수정] AI 기반 동적 선택지 생성
  const generateChoices = async (lastMessage) => {
    try {
      const childId = user?.id || null;
      const response = await chatApi.generateChoices(sessionId, childId, lastMessage);

      // AI가 생성한 선택지 + 고정 선택지 ("메뉴", "직접 입력하기")
      const dynamicChoices = response.choices || [];
      const fixedChoices = ["메뉴", "직접 입력하기"];
      const allChoices = [...dynamicChoices, ...fixedChoices];

      setChoices(allChoices);

      // AI가 반환한 감정으로 Dino 감정 업데이트
      if (response.emotion) {
        setDinoEmotion(response.emotion);
      }
    } catch (error) {
      console.error("선택지 생성 실패:", error);
      // 실패 시 기본 선택지 사용
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
    <div className="dino-wrapper">
      {/* 공룡 본체 */}
      <div
        className={`dino-container ${isJumping ? "jump" : ""}`}
        onClick={handleClick}
      >
        {/* [2025-11-04 김민중 수정] 감정에 따라 애니메이션 변경 */}
        <Lottie
          animationData={getDinoAnimation()}
          loop
          autoplay
          className="dino-lottie"
          key={dinoEmotion}
        />
      </div>

      {/* 채팅 박스 */}
      {isOpen && (
        <div className="speech-bubble chat-bubble">
          <div className="chat-header">
            <p className="chat-title">디노와 대화</p>
          </div>

          {/* [2025-11-04 김민중 수정] 메시지와 선택지를 하나의 컨테이너로 통합 */}
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

            {/* [2025-11-04 김민중 수정] 선택지를 메시지 컨테이너 안에 배치 */}
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

          {/* 직접 입력 */}
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
            <div className="menu-modal">
              <div className="menu-modal-content">
                <div className="menu-modal-header">
                  <h3>메뉴</h3>
                  <button className="close-btn" onClick={() => setIsMenuOpen(false)}>
                    ✕
                  </button>
                </div>
                <div className="menu-modal-body">
                  {!user && (
                    <button
                      className="menu-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/login");
                      }}
                    >
                      {/* [🦕 아이콘 교체됨] */}
                      <img src={iconLogin} alt="login" className="menu-icon" />
                      로그인 / 회원가입
                    </button>
                  )}
                  {user && (
                    <>
                      <button
                        className="menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/my-dinos");
                        }}
                      >
                        <img src={iconDino} alt="dino" className="menu-icon" />
                        내 공룡 친구들
                      </button>
                      <button
                        className="menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/child/registration");
                        }}
                      >
                        <img src={iconGirl} alt="child" className="menu-icon" />
                        자녀 등록
                      </button>
                      <button
                        className="menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          navigate("/parent/dashboard");
                        }}
                      >
                        <img src={iconDashboard} alt="dashboard" className="menu-icon" />
                        대시보드
                      </button>
                      <button
                        className="menu-btn"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <img src={iconLogout} alt="logout" className="menu-icon" />
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

      {!isOpen && (
        <div className="speech-bubble idle-bubble bouncey">
          <p>나 눌러봐! </p>
        </div>
      )}
    </div>
  );
}

export default DinoCharacter;
