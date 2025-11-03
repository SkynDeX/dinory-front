// src/services/api/storyApi.js
import axiosInstance from './axiosInstance';

// 동화 추천
export const getRecommendedStories = async (emotion, interests, childId, limit = 5) => {
    const res = await axiosInstance.post('/api/story/recommended', null, {
        params: { 
            emotion, 
            interests, 
            childId, 
            limit },
    });
    return res.data;
};

// 동화 생성(첫 장면)
export const generateStory = async (storyId, requestData) => {
    const res = await axiosInstance.post(
        `/api/story/${encodeURIComponent(storyId)}/generate`,
        requestData)
        ;
    return res.data;
};

// 선택 저장(호환용, 백엔드에 choice 엔드포인트가 존재)
export const saveChoice = async (completionId, choiceData) => {
    const res = await axiosInstance.post(`/api/story/completion/${completionId}/choice`, choiceData);
    return res.data;
};

// 선택 → 다음 장면
export const getNextScene = async (completionId, choiceData) => {
    const res = await axiosInstance.post(`/api/story/completion/${completionId}/next-scene`, choiceData);
    return res.data;
};

// 동화 완료
export const completeStory = async (completionId, completeData) => {
    const res = await axiosInstance.post(`/api/story/completion/${completionId}/complete`, completeData);
    return res.data;
};

// 완료 요약
export const getStoryCompletionSummary = async (completionId) => {
    const res = await axiosInstance.get(`/api/story/completion/${completionId}/summary`);
    return res.data;
};

// 커스텀 선택지
export const analyzeCustomChoice = async (completionId, sceneNumber, text) => {
    const res = await axiosInstance.post(`/api/story/analyze-custom-choice`, {
        completionId,
        sceneNumber,
        text
    });
    return res.data;
};