import React from 'react';
import './Login.css';

function Login() {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090';

    const handleSocialLogin = (provider) => {
        window.location.href = `${API_BASE_URL}/oauth2/authorize/${provider}`;
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Dinory</h1>
                <p>AI 동화 생성 서비스에 오신 것을 환영합니다</p>

                <div className="login-buttons">
                    <button
                        className="social-btn google-btn"
                        onClick={() => handleSocialLogin('google')}
                    >
                        <span>Google로 로그인</span>
                    </button>

                    <button
                        className="social-btn naver-btn"
                        onClick={() => handleSocialLogin('naver')}
                    >
                        <span>Naver로 로그인</span>
                    </button>

                    <button
                        className="social-btn kakao-btn"
                        onClick={() => handleSocialLogin('kakao')}
                    >
                        <span>Kakao로 로그인</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;
