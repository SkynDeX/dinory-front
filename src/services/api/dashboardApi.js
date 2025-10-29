import axiosInstance from '../utils/axiosInstance';

// 동화 히스토리 조회
export const getStoryHistory = async (childId, startDate, endDate, page = 0, size = 10) => {
    const params = {
        childId,
        page,
        size,
    };

    if (startDate) {
        params.startDate = startDate;
    }
    if (endDate) {
        params.endDate = endDate;
    }

    const res = await axiosInstance.get('/api/parent/dashboard/story-history', { params });
    return res.data;
};