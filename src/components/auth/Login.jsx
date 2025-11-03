import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Login.css";

function Login() {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8090";

  const footprintsRef = useRef([]);
  const loginBoxRef = useRef();
  const wrapperRef = useRef();

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorize/${provider}`;
  };

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

    // 발자국 순차 등장
    tl.fromTo(
      footprintsRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.25,
      }
    )

      // 마지막 발자국
      .to(footprintsRef.current[footprintsRef.current.length - 1], {
        scale: 1.6,
        duration: 0.25,
        yoyo: true,
        repeat: 1,
        onStart: () => {
          gsap.fromTo(
            wrapperRef.current,
            { 
                x: -10 
            },
            { 
                x: 10, duration: 0.1, yoyo: true, 
                repeat: 5, ease: "power1.inOut" 
            }
          );
        },
      })

      // 모든 발자국 서서히 사라짐
      .to(
        footprintsRef.current,
        {
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
        },
        "+=0.1"
      )

      // 로그인창 등장
      .fromTo(
        loginBoxRef.current,
        { opacity: 0, scale: 0.7, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6 },
        "-=0.1"
      );

  }, []);

 return (
    <div ref={wrapperRef} className="login-wrapper">
      {/* 배경을 움직이는 버블 느낌으로 테스트중 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`bubble bubble-${i + 1}`} />
      ))}

      {/* 발자국들 */}
      <div className="footprint-layer">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (footprintsRef.current[i] = el)}
            className={`footprint fp-${i + 1}`}
          />
        ))}
      </div>

      {/* 로그인 카드 */}
      <div ref={loginBoxRef} className="login-card">
        <h1 className="login-title">
          <span className="logo-din">Din</span>
          <span className="logo-ory">ory</span>
        </h1>
        <p className="login-sub">아이와 함께 떠나는 상상 여행</p>

        <div className="login-buttons">
          <button
            className="social-btn google"
            onClick={() => handleSocialLogin("google")}
          >
            Google로 로그인
          </button>
          <button
            className="social-btn naver"
            onClick={() => handleSocialLogin("naver")}
          >
            Naver로 로그인
          </button>
          <button
            className="social-btn kakao"
            onClick={() => handleSocialLogin("kakao")}
          >
            Kakao로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;