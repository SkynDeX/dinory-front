import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8090/api';

// 자녀 등록
export const registerChild = async (childData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/parent/child/register`,
            childData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
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
        const response = await axios.get(
            `${API_BASE_URL}/parent/children`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
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
        const response = await axios.get(
            `${API_BASE_URL}/parent/child/${childId}`,
            {
                haeders: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }                    
            }
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
        const response = await axios.put(
            `${API_BASE_URL}/parent/child/${childId}`,
            childData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
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
    const response = await axios.delete(
        `${API_BASE_URL}/parent/child/${childId}`,
        {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        }
    );
    return response.data;
    } catch (e) {
        console.error('자녀 삭제 실패:', e);
        throw e;
    }
};