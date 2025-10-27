import axiosInstance from '../utils/axiosInstance';

// 자녀 등록
export const registerChild = async (childData) => {
    try {
        const response = await axiosInstance.post('/api/children', childData);
        return response.data;
    } catch (e) {
        console.error('자녀 등록 실패:', e);
        throw e;
    }
};

// 자녀 목록 조회
export const getChildren = async () => {
    try {
        const response = await axiosInstance.get('/api/children');
        return response.data;
    } catch (e) {
        console.error('자녀 목록 조회 실패:', e);
        throw e;
    }
}

// 자녀 상세 조회
export const getChildDetail = async (childId) => {
    try {
        const response = await axiosInstance.get(`/api/children/${childId}`);
        return response.data;
    } catch (e) {
        console.error('자녀 상세 조회 실패:', e);
        throw e;
    }
};

// 자녀 수정
export const updateChild = async (childId, childData) => {
    try {
        const response = await axiosInstance.put(`/api/children/${childId}`, childData);
        return response.data;
    } catch (e) {
        console.error('자녀 수정 실패:', e);
        throw e;
    }
};

// 자녀 삭제
export const deleteChild = async (childId) => {
  try {
    const response = await axiosInstance.delete(`/api/children/${childId}`);
    return response.data;
    } catch (e) {
        console.error('자녀 삭제 실패:', e);
        throw e;
    }
};