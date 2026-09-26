import api from './client';

export const historyApi = {
  getHistory: async (params = {}) => {
    const res = await api.get('/history', { params });
    return res.data;
  },
  addEntry: async (data) => {
    const res = await api.post('/history', data);
    return res.data;
  },
  deleteEntry: async (id) => {
    const res = await api.delete(`/history/${id}`);
    return res.data;
  },
  getTimeline: async () => {
    const res = await api.get('/history/timeline');
    return res.data;
  },
};
