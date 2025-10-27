import React, { useState } from "react";
import Lottie from "lottie-react";
import "./DinoCharacter.css";
import dinoAnimation from "../../assets/dino.json";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api/authApi";
import { useAuth } from "../../context/AuthContext";

function DinoCharacter() {
    const [isOpen, setIsOpen] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            navigate("/login");
        } catch (error) {
            console.error('Logout failed:', error);
            logout();
            navigate("/login");
        }
    };

    const handleClick = () => {
        setIsJumping(true);
        setTimeout(() => setIsJumping(false), 600);
        setIsOpen((prev) => !prev);
    };

    return (
        <div className="dino-wrapper">
            {/* 공룡 본체 */}
            <div
                className={`dino-container ${isJumping ? "jump" : ""}`}
                onClick={handleClick}
            >
                <Lottie
                    animationData={dinoAnimation}
                    loop
                    autoplay
                    className="dino-lottie"
                />
            </div>

            {/* 클릭하면 메뉴 말풍선뜨게끔 */}
            {isOpen && (
                <div className="speech-bubble menu-bubble">
                    <p className="menu-title">뭐 할까?</p>
                    {!user && (
                        <div>
                            <button onClick={() => navigate("/login")}>로그인/회원가입</button>
                        </div>
                    )}
                    {user && (
                        <div>
                            <button onClick={() => navigate("/my-dinos")}>내 공룡 친구들</button>
                            <button onClick={() => navigate("/child/registration")}>자녀 등록</button>
                            <button onClick={() => navigate("/parent/dashboard")}>대시보드</button>
                            <button onClick={handleLogout}>로그아웃</button>
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
