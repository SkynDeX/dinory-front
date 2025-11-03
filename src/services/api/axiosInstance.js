// axiosInstance.js — 최종본
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090';

const axiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  withCredentials: true,
});

// ========== Request ==========
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🔵 [REQ] Axios Request Interceptor 실행');
    console.log('URL:', (config.baseURL || baseURL) + (config.url || ''));
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
    console.error('🔴 [REQ] Interceptor 에러:', error);
    return Promise.reject(error);
  }
);

// ======= 401 처리: 리프레시 + 큐 재시도 =======
let isRefreshing = false;
let pendingQueue = [];
const pushQueue = (resolve, reject) => pendingQueue.push({ resolve, reject });
const flushQueue = (error, newToken) => {
  pendingQueue.forEach(p => (error ? p.reject(error) : p.resolve(newToken)));
  pendingQueue = [];
};

// refresh 호출 (엔드포인트 자동판별)
async function callRefresh() {
  const tryPaths = ['/api/auth/refresh-token', '/api/auth/refresh'];
  let lastErr;
  for (const p of tryPaths) {
    try {
      console.log(`🟠 리프레시 시도: ${p}`);
      const resp = await axios.post(`${baseURL}${p}`, {}, { withCredentials: true });
      // 응답 키명 통일 처리
      const newToken =
        resp?.data?.accessToken ||
        resp?.data?.token ||
        resp?.data?.access_token;
      if (!newToken) throw new Error('리프레시 응답에 accessToken이 없습니다.');
      return newToken;
    } catch (e) {
      lastErr = e;
      console.warn(`⚠️ 리프레시 실패: ${p}`, e?.response?.status, e?.message);
    }
  }
  throw lastErr || new Error('리프레시 실패');
}

// ========== Response ==========
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('🟢 [RES] 성공', response.status, response.config?.url);
    // HTML 로그인 페이지가 섞여 온 경우 차단
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.warn('⚠️ HTML 응답 감지 - 인증 실패로 간주');
      return Promise.reject({
        response: { status: 401, data: { error: 'Unauthorized', message: 'HTML login page received' } },
        config: response.config,
      });
    }
    return response;
  },
  async (error) => {
    console.error('🔴 [RES] 에러:', error);
    const { response, config: originalConfig } = error || {};
    console.log('응답:', response);

    // 네트워크/타 상태 에러는 그대로
    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    // refresh 호출 자체가 401이면 종료
    const url = (originalConfig?.url || '');
    if (url.includes('/api/auth/refresh') || url.includes('/api/auth/refresh-token')) {
      console.error('⛔ 리프레시 엔드포인트 401 → 로그인 필요');
      return Promise.reject(error);
    }

    // 루프 방지
    if (originalConfig._retry) {
      console.warn('⛔ 이미 재시도된 요청입니다.');
      return Promise.reject(error);
    }
    originalConfig._retry = true;

    try {
      if (isRefreshing) {
        console.log('⏳ 리프레시 진행 중 → 큐 대기:', url);
        const newTok = await new Promise((resolve, reject) => pushQueue(resolve, reject));
        originalConfig.headers.Authorization = `Bearer ${newTok}`;
        console.log('🔁 큐 재시도:', url);
        return axiosInstance(originalConfig);
      }

      isRefreshing = true;
      console.log('⚠️ 401 감지 → 토큰 갱신 시도');
      const newToken = await callRefresh();
      localStorage.setItem('accessToken', newToken);
      console.log('✅ 토큰 갱신 성공');

      // 대기중 모두 깨우기
      flushQueue(null, newToken);

      // 원요청 재시도
      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      console.log('🔁 리프레시 후 원요청 재시도:', url);
      return axiosInstance(originalConfig);
    } catch (refreshErr) {
      console.error('❌ 토큰 갱신 실패:', refreshErr);
      flushQueue(refreshErr, null);
      localStorage.removeItem('accessToken');
      // 여기서 바로 redirect하지 않음(페이지 의존성 줄이기). 필요시 상위에서 처리.
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
