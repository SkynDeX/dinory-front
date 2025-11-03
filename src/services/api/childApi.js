import axiosInstance from './axiosInstance';

const prefersNotFound = (e) =>
  e && e.response && (e.response.status === 404 || e.response.status === 405);

const withFallback = async (attempts) => {
  let lastErr;
  for (const fn of attempts) {
    try {
      const res = await fn();
      return res.data;
    } catch (e) {
      lastErr = e;
      if (prefersNotFound(e)) continue; // 다음 시도
      throw e; // 다른 에러는 즉시 반환
    }
  }
  throw lastErr;
};

// 자녀 등록
export const registerChild = async (childData) => {
  return withFallback([
    () => axiosInstance.post('/api/children', childData),
    () => axiosInstance.post('/api/parent/child/register', childData),
  ]);
};

// 자녀 목록 조회
export const getChildren = async () => {
  return withFallback([
    () => axiosInstance.get('/api/children'),
    () => axiosInstance.get('/api/parent/children'),
  ]);
};

// 자녀 상세 조회
export const getChildDetail = async (childId) => {
  return withFallback([
    () => axiosInstance.get(`/api/children/${childId}`),
    () => axiosInstance.get(`/api/parent/child/${childId}`),
  ]);
};

// 자녀 수정
export const updateChild = async (childId, childData) => {
  return withFallback([
    () => axiosInstance.put(`/api/children/${childId}`, childData),
    () => axiosInstance.put(`/api/parent/child/${childId}`, childData),
  ]);
};

// 자녀 삭제
export const deleteChild = async (childId) => {
  return withFallback([
    () => axiosInstance.delete(`/api/children/${childId}`),
    () => axiosInstance.delete(`/api/parent/child/${childId}`),
  ]);
};
