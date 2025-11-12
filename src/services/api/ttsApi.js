// ttsApi.js - TTS(Text-to-Speech) API 서비스
import axiosInstance from './axiosInstance';

/**
 * Google Cloud TTS로 텍스트를 음성(MP3)으로 변환
 * @param {string} text - 변환할 텍스트
 * @param {string} voiceName - 음성 이름 (옵션, 예: "ko-KR-Wavenet-A")
 * @param {number} speakingRate - 말하기 속도 (옵션, 기본 1.0)
 * @param {number} pitch - 음높이 (옵션, 기본 0.0)
 * @returns {Promise<Blob>} MP3 오디오 Blob
 */
export const generateGoogleCloudTts = async (text, voiceName = null, speakingRate = 1.0, pitch = 0.0) => {
    try {
        const response = await axiosInstance.post('/api/tts/googlecloud', {
            text,
            voiceName,
            speakingRate,
            pitch
        }, {
            responseType: 'blob' // 바이너리 데이터(오디오) 수신
        });

        return response.data; // Blob 반환
    } catch (error) {
        console.error('Google Cloud TTS 생성 실패:', error);
        throw error;
    }
};

/**
 * Gemini TTS로 텍스트를 음성(WAV)으로 변환
 * @param {string} text - 변환할 텍스트
 * @param {string} voiceName - 음성 이름 (옵션)
 * @returns {Promise<Blob>} WAV 오디오 Blob
 */
export const generateGeminiTts = async (text, voiceName = null) => {
    try {
        console.log('📡 Gemini TTS 요청:', { text: text.substring(0, 50) + '...' });

        const response = await axiosInstance.post('/api/tts/gemini', {
            text,
            voiceName
        }, {
            responseType: 'blob' // 바이너리 데이터(오디오) 수신
        });

        console.log('✅ Gemini TTS 응답 받음:', response.data.size, 'bytes');
        return response.data; // Blob 반환
    } catch (error) {
        console.error('❌ Gemini TTS 생성 실패:', error);
        throw error;
    }
};
