import axiosInstance from "./api/axiosInstance";

// 공룡 목록 조회
export const getMyDinos = async () => {
    try {
        const res = await axiosInstance.get('/api/dino/my');
        return res.data;
    } catch (error) {
        console.error('공룡 목록 조회 실패 : ', error);
        throw error;
    }
};

// 공룡 부화
export const hatchDino = async (name, colorType) => {
    try {
        const res = await axiosInstance.post('/api/dino/hatch', null, {
            params: {name, colorType}
        });
        return res.data;
    } catch (error) {
        console.error('공룡 부화 실패 : ', error);

        if(error.res?.data?.message) {
            throw new Error(error.res.data.message);
        } else if(error.message) {
            throw new Error(error.message);
        } else {
            throw new Error('공룡 부화에 실패했습니다.');
        }
    }
};
