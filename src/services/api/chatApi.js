import axiosInstance from '../utils/axiosInstance';

export const chatApi = {
    // 채팅 세션 초기화
    initChatSession: async (childId) => {
        const response = await axiosInstance.post('/api/chat/init', {
            childId
        });
        return response.data;
    },

    // 메시지 전송
    sendMessage: async (sessionId, message) => {
        const response = await axiosInstance.post('/api/chat/message', {
            sessionId,
            message
        });
        return response.data;
    },

    // 채팅 세션 종료
    endChatSession: async (sessionId) => {
        const response = await axiosInstance.post(`/api/chat/${sessionId}/end`);
        return response.data;
    },

    // 채팅 세션 조회
    getChatSession: async (sessionId) => {
        const response = await axiosInstance.get(`/api/chat/${sessionId}`);
        return response.data;
    },

    // 자식별 채팅 세션 목록 조회
    getChatSessionsByChild: async (childId) => {
        const response = await axiosInstance.get(`/api/chat/child/${childId}`);
        return response.data;
    },

    // 동화 완료 후 챗봇 세션 초기화
    initChatSessionFromStory: async (completionId) => {
        const response = await axiosInstance.post('/api/chat/init-from-story', {
            completionId
        });
        return response.data;
    }
};
