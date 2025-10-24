import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api/authApi';

function OAuth2Callback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const handleOAuth2Callback = async () => {
            const accessToken = searchParams.get('accessToken');
            const error = searchParams.get('error');

            if (error) {
                console.error('OAuth2 login failed:', error);
                alert('로그인에 실패했습니다: ' + error);
                navigate('/login');
                return;
            }

            if (accessToken) {
                try {
                    // 먼저 토큰을 localStorage에 저장
                    localStorage.setItem('accessToken', accessToken);

                    // 그 다음 사용자 정보 가져오기
                    const userData = await authApi.getCurrentUser();
                    login(accessToken, userData);
                    navigate('/child/select');
                } catch (error) {
                    console.error('Failed to get user info:', error);
                    alert('사용자 정보를 가져오는데 실패했습니다');
                    localStorage.removeItem('accessToken');
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        };

        handleOAuth2Callback();
    }, [searchParams, navigate, login]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '1.5rem'
        }}>
            로그인 처리 중...
        </div>
    );
}

export default OAuth2Callback;
