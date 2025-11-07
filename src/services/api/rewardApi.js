import axiosInstance from "./axiosInstance";

// 현재 보상상태 조회 (별/공룡알)
export const getMyReward = async () => {
    try {
        const res = await axiosInstance.get('/api/reward/my');
        return res.data;
    } catch(error) {
        console.error('보상 조회 실패: ', error);
        throw error;
    }
};

// 별 추가(테스트용)
// 실제로는 동화 완료시 백엔드에서 자동 추가
export const addStar = async () => {
    try {
        const res = await axiosInstance('/api/reawrd/star');
        return res.data;
    } catch (error) {
        console.error('별 추가 실패 :' , error);
        throw error;
    }
};

// 공롱알 추가(테스트용)
// 실제로는 동화 완료시 백엔드에서 자동 추가
export const addEgg = async () => {
    try {
        const res = await axiosInstance('/api/reawrd/egg');
        return res.data;
    } catch (error) {
        console.error('공룡알 추가 실패 :' , error);
        throw error;
    }
};

