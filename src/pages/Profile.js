import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api/authApi';
import './Profile.css';

function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

    const handleBack = () => {
        navigate('/');
    };

    const handleWithdraw = async () => {
        try {
            await authApi.withdraw();
            logout();
            alert('회원 탈퇴가 완료되었습니다');
            navigate('/login');
        } catch (error) {
            console.error('Withdraw failed:', error);
            alert('회원 탈퇴에 실패했습니다');
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-content">
                <h1>프로필</h1>

                {user && (
                    <div className="profile-info">
                        <div className="info-item">
                            <label>이름</label>
                            <p>{user.name}</p>
                        </div>

                        <div className="info-item">
                            <label>이메일</label>
                            <p>{user.email}</p>
                        </div>

                        <div className="info-item">
                            <label>회원 ID</label>
                            <p>{user.id}</p>
                        </div>
                    </div>
                )}

                <div className="profile-buttons">
                    <button className="btn back-btn" onClick={handleBack}>
                        돌아가기
                    </button>
                    <button
                        className="btn withdraw-btn"
                        onClick={() => setShowWithdrawConfirm(true)}
                    >
                        회원 탈퇴
                    </button>
                </div>

                {showWithdrawConfirm && (
                    <div className="confirm-modal">
                        <div className="confirm-box">
                            <h3>정말 탈퇴하시겠습니까?</h3>
                            <p>탈퇴 후에는 모든 데이터가 삭제됩니다.</p>
                            <div className="confirm-buttons">
                                <button
                                    className="btn cancel-btn"
                                    onClick={() => setShowWithdrawConfirm(false)}
                                >
                                    취소
                                </button>
                                <button
                                    className="btn confirm-withdraw-btn"
                                    onClick={handleWithdraw}
                                >
                                    탈퇴하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
