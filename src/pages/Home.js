import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api/authApi';
import './Home.css';

function Home() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            logout();
            navigate('/login');
        }
    };

    const handleProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <h1>Welcome to Dinory!</h1>
                {user && (
                    <div className="user-info">
                        <h2>안녕하세요, {user.name}님!</h2>
                        <p>이메일: {user.email}</p>
                    </div>
                )}

                <div className="home-buttons">
                    <button className="btn profile-btn" onClick={handleProfile}>
                        프로필 보기
                    </button>
                    <button className="btn test-btn" onClick={() => navigate('/image-test')}>
                        이미지 생성 테스트
                    </button>
                    <button className="btn logout-btn" onClick={handleLogout}>
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;
