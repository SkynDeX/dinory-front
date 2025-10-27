import axios from 'axios';

const API_BASE_URL = process.env.REACT_API_BASE_URL || 'http://localhost:8090/api';

// 동화 추천
export const getRecommendedStories = async (emotion, interests, childId, limit = 5) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/story/recommended`,
            null,
            {
                params: {
                    emotion,
                    interests,
                    childId,
                    limit
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

        return response.data;

    } catch(e) {
        console.error('동화 추천 실패: ', e);
        throw e;
    }
};

// 동화 생성
export const generateStory = async (storyId, requestData) => { 
    try {
        const response = await axios.post(
            `${API_BASE_URL}/story/${storyId}/generate`,
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

        return response.data;

    } catch (e) {
        console.error('동화 생성 실패: ', e);
        throw e;
    }
};

// 선택지 저장
export const saveChoice = async (completionId, choiceData) => { 
    try {
        const response = await axios.post(
            `${API_BASE_URL}/story/completion/${completionId}/choice`,
            choiceData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

        return response.data;

    } catch (e) {
        console.error('선택지 저장 실패: ', e);
        throw e;
    }
};

// 동화 완료
export const completeStory = async (completionId, completeData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/story/completion/${completionId}/complete`,
            completeData,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

        return response.data;

    } catch (e) {
        console.error('동화 완료 실패: ', e);
        throw e;
    }
};

// 동화 완료 요약 조회
export const getStoryCompletionSummary = async (completionId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/story/completion/${completionId}/summary`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            }
        );

        return response.data;

    } catch (e) {
        console.error('동화 완료 요약 조회 실패: ', e);
        throw e;
    }
};