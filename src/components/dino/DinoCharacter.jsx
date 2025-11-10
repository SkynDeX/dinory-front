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
        setMessages(
          response.messages.map((msg) => ({
            sender: msg.sender === "AI" ? "AI" : "USER",
            message: msg.message,
            createdAt: msg.createdAt,
          }))
        );
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
      const response = await chatApi.sendMessage(sessionId, currentMessage);
      const aiMessage = {
        sender: "AI",
        message: response.aiResponse,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
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
      setDinoEmotion("neutral");
    } finally {
      setIsLoading(false);
      setIsTextInputMode(false);
    }
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
    <div className="dino-wrapper">
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

      {!isOpen && (
        <div className="speech-bubble idle-bubble bouncey">
          <p>나 눌러봐! </p>
        </div>
      )}
    </div>
  );
}

export default DinoCharacter;
