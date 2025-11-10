import react, { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api/authApi';
import './Settings.css';

function Settings() {

    const { user, logout } = useAuth();
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);


    const handleWithdraw = async () => {
        try {
            await authApi.withdraw();
            logout();
            alert('회원 탈퇴가 완료되었습니다.');
            window.location.href = '/login';
        } catch (e) {
            console.error('회원 탈퇴 실패:', e);
            alert('회원 탈퇴에 실패하였습니다.');
        }
    };

    return(

        <div className="settings_wrapper">
            <h1>설정</h1>

            {/* 계정 정보 */}
            <div className="settings_section">
                <h2 className="section_title">계정 정보</h2>
                <div className="account_info_card">
                    <div className="info_row">
                        <span className="info_label">이름</span>
                        <span className="info_value">{user?.name}</span>
                    </div>
                    <div className="info_row">
                        <span className="info_label">이메일</span>
                        <span className="info_value">{user?.email}</span>
                    </div>
                    <div className="info_row">
                        <span className="info_label">로그인 방식</span>
                        <span className="info_value">
                            {user?.email?.includes('@kakao') && '카카오'}
                            {user?.email?.includes('@naver') && '네이버'}
                            {user?.email?.includes('@gmail') && '구글'}
                            {!user?.email?.includes('@kakao') && 
                            !user?.email?.includes('@naver') && 
                            !user?.email?.includes('@gmail') && '소셜 로그인'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 회원 탈퇴 */}
            <div className="settings_section">
                <h2 className="section_title">회원 탈퇴</h2>
                <p className="section_description">
                    탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
                </p>
                <button 
                    className="btn_withdraw"
                    onClick={() => setShowWithdrawConfirm(true)}
                >
                    회원 탈퇴
                </button>
            </div>

            {/* 탈퇴 확인 모달 */}
            {showWithdrawConfirm && (
                <div className="modal_overlay" onClick={() => setShowWithdrawConfirm(false)}>
                    <div className="modal_box" onClick={(e) => e.stopPropagation()}>
                        <h3>정말 탈퇴하시겠습니까?</h3>
                        <p>탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
                        <div className="modal_buttons">
                            <button
                                className="btn_modal_cancel"
                                onClick={() => setShowWithdrawConfirm(false)}
                            >
                                취소
                            </button>
                            <button
                                className="btn_modal_confirm"
                                onClick={handleWithdraw}
                            >
                                탈퇴하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
     );
}

export default Settings;