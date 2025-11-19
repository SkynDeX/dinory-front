import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DinoCharacter from "../../components/dino/DinoCharacter";
import "./HomePage.css";
// import heroImage from "../../assets/backgrounds/jungle.png";

function HomePage() {
    const navigate = useNavigate();

    // 디노 등장 제어
    const [showDino, setShowDino] = useState(false);

    // 마지막 멘트에서 버튼 강조!!
    const [highlightStartButton, setHighlightStartButton] = useState(false);

    // 파티클 1회 실행 여부
    // const [triggerParticles, setTriggerParticles] = useState(false);

    useEffect(() => {
        // 2초 뒤 디노 등장
        const timer = setTimeout(() => {
            setShowDino(true);

            // // 디노 등장과 동시에 파티클 발사
            // setTriggerParticles(true);

            // // 1초 뒤 파티클 자동 종료
            // setTimeout(() => setTriggerParticles(false), 1000);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="home-page">
            <div className="main-container">

                {/* 로고 */}
                <div className="logo-wrapper">
                    <h1 className="main-logo">
                        <span className="green">Din</span>
                        <span className="coral">o</span>
                        <span className="sky">r</span>
                        <span className="yellow">y</span>
                    </h1>
                </div>

                {/* 파티클 */}
                {/* {triggerParticles && <div className="particle-wrapper"></div>} */}

                {/* 디노 (2초 후 등장) */}
                {showDino && (
                    <div className="hero-dino-wrapper">
                        {/* 버튼 강조 및 setter 전달 */}
                        <DinoCharacter
                            isHome={true}
                            highlightStartButton={highlightStartButton}
                            setHighlightStartButton={setHighlightStartButton}
                        />
                    </div>
                )}

                {/* CTA 버튼 */}
                <div className="cta-wrapper">
                    <button
                        className={`btn-main ${highlightStartButton ? "shake-btn" : ""}`}
                        onClick={() => navigate("/child/select")}
                    >
                        동화 읽기 시작하기
                    </button>
                </div>

            </div>
        </div>
    );
}

export default HomePage;
