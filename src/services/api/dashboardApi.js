import axiosInstance from './axiosInstance';

const buildRangeParams = ({ period, startDate, endDate } = {}) => {
  if (startDate && endDate) return { startDate, endDate };
  return { period };
};

// 대시보드
// export const getOverview = async (childId, period = "day") => {
//     const res = await axiosInstance.get('/api/parent/dashboard/overview', {
//         params: {childId, period}
//     });

//     return res.data;
// };
export const getOverview = async (childId, opts = {}) => {
  const { period = 'day', startDate, endDate } = opts;
  const res = await axiosInstance.get('/api/parent/dashboard/overview', {
    params: { childId, ...buildRangeParams({ period, startDate, endDate }) }
  });
  return res.data;
};

// 성장 리포트 조회
// export const getGrowthReport = async (childId, period = 'month') => {
//     const res = await axiosInstance.get('/api/parent/dashboard/growth-report', {
//         params: {childId, period}
//     });
//     return res.data;
// };
export const getGrowthReport = async (childId, opts = {}) => {
  const { period = 'month', startDate, endDate } = opts;
  const res = await axiosInstance.get('/api/parent/dashboard/growth-report', {
    params: { childId, ...buildRangeParams({ period, startDate, endDate }) }
  });
  return res.data;
};

// 성장 리포트 AI 분석 조회 (비동기)
// export const getGrowthReportAIAnalysis = async (childId, period = 'month') => {
//     const res = await axiosInstance.get('/api/parent/dashboard/growth-report/ai-analysis', {
//         params: { childId, period }
//     });
//     return res.data;
// };
export const getGrowthReportAIAnalysis = async (childId, opts = {}) => {
  const { period = 'month', startDate, endDate } = opts;
  const res = await axiosInstance.get('/api/parent/dashboard/growth-report/ai-analysis', {
    params: { childId, ...buildRangeParams({ period, startDate, endDate }) }
  });
  return res.data;
};

// 동화 히스토리 조회
// export const getStoryHistory = async (childId, startDate, endDate, page = 0, size = 10) => {
//     const params = {
//         childId,
//         page,
//         size,
//     };

//     if (startDate) {
//         params.startDate = startDate;
//     }
//     if (endDate) {
//         params.endDate = endDate;
//     }

//     const res = await axiosInstance.get('/api/parent/dashboard/story-history', { params });
//     return res.data;
// };
export const getStoryHistory = async (childId, startDate, endDate, page = 0, size = 10) => {
  const params = { childId, page, size };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await axiosInstance.get('/api/parent/dashboard/story-history', { params });
  return res.data;
};

// 추천 동화 조회 - 대시보드 분석 기반
// export const getRecommendedStories = async (childId, period = 'week', limit = 5) => {
//     const res = await axiosInstance.post('/api/parent/dashboard/recommended-stories', null, {
//         params: {
//             childId,
//             period,
//             limit
//         }
//     });
//     return res.data;
// };
export const getRecommendedStories = async (childId, opts = {}) => {
  const { period = 'week', startDate, endDate, limit = 5 } = opts;
  const res = await axiosInstance.post('/api/parent/dashboard/recommended-stories', null, {
    params: { childId, limit, ...buildRangeParams({ period, startDate, endDate }) }
  });
  return res.data;
};

// AI 인사이트 조회 (비동기)
// export const getAIInsights = async (childId, period = 'day') => {
//     const res = await axiosInstance.get('/api/parent/dashboard/overview/insights', {
//         params: { childId, period }
//     });
//     return res.data;
// };
export const getAIInsights = async (childId, opts = {}) => {
  const { period = 'day', startDate, endDate } = opts;
  const res = await axiosInstance.get('/api/parent/dashboard/overview/insights', {
    params: { childId, ...buildRangeParams({ period, startDate, endDate }) }
  });
  return res.data;
};

// Topics 조회 (비동기)
// export const getTopics = async (childId, period = 'day') => {
//     const res = await axiosInstance.get('/api/parent/dashboard/overview/topics', {
//         params: { childId, period }
//     });
//     return res.data;
// };
export const getTopics = async (childId, opts = {}) => {
  const { period = 'day', startDate, endDate } = opts;
  const res = await axiosInstance.get('/api/parent/dashboard/overview/topics', {
    params: { childId, ...buildRangeParams({ period, startDate, endDate }) }
  });
  return res.data;
};



