import api from './client';

export const watchlistApi = {
  getWatchlist: async (params = {}) => {
    const res = await api.get('/watchlist', { params });
    return res.data;
  },
  addToWatchlist: async (data) => {
    const res = await api.post('/watchlist', data);
    return res.data;
  },
  updatePriority: async (id, data) => {
    const res = await api.patch(`/watchlist/${id}/priority`, data);
    return res.data;
  },
  removeFromWatchlist: async (id) => {
    const res = await api.delete(`/watchlist/${id}`);
    return res.data;
  },
  getSuggestions: async (params = {}) => {
    const res = await api.get('/watchlist/suggestions', { params });
    return res.data;
  },
};
