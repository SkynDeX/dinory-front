import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090',
    timeout: 60000, // 60초 (AI 동화 생성은 시간이 오래 걸림)
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        console.log('🔵 Axios Request Interceptor 실행');
        console.log('URL:', config.baseURL + config.url);
        console.log('Method:', config.method);
        console.log('Data:', config.data);

        const token = localStorage.getItem('accessToken');
        console.log('Token 있음?', token ? 'Yes' : 'No');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Authorization 헤더 설정됨');
        }
        return config;
    },
    (error) => {
        console.error('🔴 Axios Request Interceptor 에러:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('🟢 Axios Response Interceptor 성공');
        console.log('Status:', response.status);
        console.log('Data:', response.data);

        // HTML 로그인 페이지를 받은 경우 (인증 실패)
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            console.warn('⚠️ HTML 응답 감지 - 인증 실패로 처리');
            // 401 에러로 변환하여 에러 핸들러로 전달
            return Promise.reject({
                response: {
                    status: 401,
                    data: { error: 'Unauthorized', message: 'HTML login page received' }
                },
                config: response.config
            });
        }

        return response;
    },
    async (error) => {
        console.error('🔴 Axios Response Interceptor 에러');
        console.error('에러:', error);
        console.error('응답:', error.response);

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('⚠️ 401 에러 - 토큰 갱신 시도');
            originalRequest._retry = true;

            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = response.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                console.log('✅ 토큰 갱신 성공');

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('❌ 토큰 갱신 실패 - 로그인 페이지로 이동');
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
