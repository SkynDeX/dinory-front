import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";   
import HomePage from "../home/HomePage.jsx";
import "./Intro.css";

function Intro() {
  const { user } = useAuth();                    // 로그인된 사용자 정보를 가져옴
  const navigate = useNavigate();                // 네비 훅 사용
  const location = useLocation();                // URL 파라미터 확인용
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false); // 시작 버튼 눌렀는지 여부 확인
  const [ended, setEnded] = useState(false);     // 영상이 끝났는지 여부 확인
  const [fadingOut, setFadingOut] = useState(false); // 페이드 아웃 중인지 확인

  // 로그인 상태면 자동으로 main으로 이동 ( 인트로로 이동하는거 막기 )
  useEffect(() => {
    if (user) {
      navigate("/main", { replace: true });   
    }
  }, [user, navigate]);

  // 시작 버튼 클릭 시에 실행되게끔
  const handleStart = () => {
    if (!videoRef.current) return;
    setStarted(true);
    videoRef.current.currentTime = 0;
    videoRef.current.play();

    // 영상이 끝나면 페이드아웃 후 메인 화면 전환시키기
    videoRef.current.onended = () => {
      setFadingOut(true); 
      setTimeout(() => {
        setEnded(true); 
      }, 1200);
    };
  };

  // URL 파라미터로 자동재생 처리
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autoplay = params.get("autoplay");
    if (autoplay === "true" && !started) {
      // 살짝 지연시켜 video 엘리먼트가 완전히 DOM에 붙은 뒤 재생하도록 함
      const timer = setTimeout(() => {
        handleStart();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.search]);


  // // @@@@@@@@@ Skip 개발자 모드 @@@@@@@@@@
  // const handleSkip = () => {
  //   setFadingOut(true);
  //   setTimeout(() => setEnded(true), 800);
  // };

  // 모바일 등에서도 자동 재생이 되게 보완
  useEffect(() => {
    if (started && videoRef.current?.paused) {
      videoRef.current.play().catch(() => {});
    }
  }, [started]);

  return (
    <>
      {/* 인트로 화면 */}
      {!ended && (
        <div className="intro-container">
          <AnimatePresence mode="wait">
            <motion.div
              key="intro-video"
              initial={{ opacity: 1 }}
              animate={{ opacity: fadingOut ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="intro-wrapper"
            >
              {/* 배경 영상 */}
              <video
                ref={videoRef}
                src="/intro.mp4"
                className="intro-video"
                muted
                playsInline
                preload="auto"
              />

              {/* 시작 버튼 */}
              {!started && (
                <motion.button
                  className="start-btn"
                  onClick={handleStart}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  동화 세상으로 들어가기
                </motion.button>
              )}

              {/* @@@@@@@ 개발자용 Skip 버튼 — 항상 표시 @@@@@@@@
              <motion.button
                className="skip-btn"
                onClick={handleSkip}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                스킵하기!!! 개발자 전용!!
              </motion.button> */}
              
              <div className="intro-overlay" />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* 영상 종료 후에 메인 화면 */}
      {ended && (
        <motion.div
          key="homepage"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <HomePage />
        </motion.div>
      )}
    </>
  );
};

export default Intro;
