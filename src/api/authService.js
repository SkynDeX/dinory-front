import axiosInstance from './axios';

export const authService = {
    refreshToken: async () => {
        const response = await axiosInstance.post('/api/auth/refresh');
        return response.data;
    },

    logout: async () => {
        const response = await axiosInstance.post('/api/auth/logout');
        localStorage.removeItem('accessToken');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await axiosInstance.get('/api/auth/me');
        return response.data;
    },

    withdraw: async () => {
        const response = await axiosInstance.delete('/api/auth/withdraw');
        localStorage.removeItem('accessToken');
        return response.data;
    }
};
