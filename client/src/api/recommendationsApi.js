import api from './client';

export const recommendationsApi = {
  getRecommendations: async () => {
    const res = await api.get('/recommendations');
    return res.data;
  },
  getSimilar: async (params) => {
    const res = await api.get('/recommendations/similar', { params });
    return res.data;
  },
  sendFeedback: async (feedbackData) => {
    const res = await api.post('/recommendations/feedback', feedbackData);
    return res.data;
  },
};
