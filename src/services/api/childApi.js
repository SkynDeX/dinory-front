import axiosInstance from '../utils/axiosInstance';

// 자녀 등록
export const registerChild = async (childData) => {
    try {
        const response = await axiosInstance.post(
            '/api/parent/child/register',
            childData
        );
        return response.data;
    } catch (e) {
        console.error('자녀 등록 실패:', e);
        throw e;
    }
};


// 자녀 목록 조회
export const getChildren = async () => {
    try {
        const response = await axiosInstance.get(
            '/api/parent/children'
        );
        return response.data;
    } catch (e) {
        console.error('자녀 목록 조회 실패:', e);
        throw e;
    }
}


// 자녀 상세 조회
export const getChildDetail = async (childId) => {
    try {
        const response = await axiosInstance.get(
            `/api/parent/child/${childId}`
        );
        return response.data;
    } catch (e) {
        console.error('자녀 상세 조회 실패:', e);
        throw e;
    }
};


// 자녀 수정
export const updateChild = async (childId, childData) => {
    try {
        const response = await axiosInstance.put(
            `/api/parent/child/${childId}`,
            childData
        );
        return response.data;
    } catch (e) {
        console.error('자녀 수정 실패:', e);
        throw e;
    }
};


// 자녀 삭제
export const deleteChild = async (childId) => {
  try {
    const response = await axiosInstance.delete(
        `/api/parent/child/${childId}`
    );
    return response.data;
    } catch (e) {
        console.error('자녀 삭제 실패:', e);
        throw e;
    }
};