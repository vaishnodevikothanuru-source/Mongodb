import api from './client';

export const discoverApi = {
  getCurated: async (category = 'popular', page = 1) => {
    const res = await api.get('/discover/curated', { params: { category, page } });
    return res.data;
  },
  getMoodMovies: async (mood) => {
    const res = await api.get('/discover/mood', { params: { mood } });
    return res.data;
  },
  searchExternal: async (query, page = 1) => {
    const res = await api.get('/discover/search', { params: { query, page } });
    return res.data;
  },
  getExternalDetails: async (id) => {
    const res = await api.get(`/discover/details/${id}`);
    return res.data;
  },
};
