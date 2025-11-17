import axiosInstance from './axiosInstance';

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

    // [2025-11-07 추가] 대화 종료 버튼 클릭 기록 (세션은 활성 유지)
    recordChatClose: async (sessionId) => {
        const response = await axiosInstance.post(`/api/chat/${sessionId}/close`);
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
    },

    // [2025-11-04 김민중 추가] AI 기반 동적 선택지 생성
    generateChoices: async (sessionId, childId, lastMessage) => {
        const response = await axiosInstance.post('/api/chat/generate-choices', {
            sessionId,
            childId,
            lastMessage
        });
        return response.data;
    },

    // [2025-11-07 추가] DinoCharacter용 활성 세션 조회 또는 생성
    // - 아이별로 하나의 메인 세션을 계속 유지
    // - 과거 대화 내역 포함
    getOrCreateActiveSession: async (childId) => {
        const response = await axiosInstance.get(`/api/chat/child/${childId}/active-session`);
        return response.data;
    },

    // [2025-11-14 추가] 사용자 메시지에서 페이지 이동 의도 분석
    analyzeNavigationIntent: async (message) => {
        const response = await axiosInstance.post('/api/chat/analyze-navigation', {
            message
        });
        return response.data;
    },

    // [2025-11-17 추가] 특정 패턴을 포함하는 메시지 삭제 (과거 잘못된 응답 정리용)
    deleteMessagesWithPattern: async (sessionId, pattern) => {
        const response = await axiosInstance.delete(`/api/chat/session/${sessionId}/messages/pattern`, {
            params: { pattern }
        });
        return response.data;
    },

    // [2025-11-17 추가] 세션의 모든 메시지 삭제
    clearSessionMessages: async (sessionId) => {
        const response = await axiosInstance.delete(`/api/chat/session/${sessionId}/messages`);
        return response.data;
    },

    // [2025-11-17 추가] 네비게이션 메시지 저장 (AI 호출 없이)
    saveNavigationMessage: async (sessionId, userMessage, systemResponse) => {
        const response = await axiosInstance.post('/api/chat/message/navigation', {
            sessionId,
            userMessage,
            systemResponse
        });
        return response.data;
    }
};
