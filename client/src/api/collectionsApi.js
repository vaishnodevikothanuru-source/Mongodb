import api from './client';

export const collectionsApi = {
  getCollections: async () => {
    const res = await api.get('/collections');
    return res.data;
  },
  getCollectionById: async (id) => {
    const res = await api.get(`/collections/${id}`);
    return res.data;
  },
  createCollection: async (data) => {
    const res = await api.post('/collections', data);
    return res.data;
  },
  updateCollection: async (id, data) => {
    const res = await api.put(`/collections/${id}`, data);
    return res.data;
  },
  deleteCollection: async (id) => {
    const res = await api.delete(`/collections/${id}`);
    return res.data;
  },
  addMovie: async (collectionId, movieId) => {
    const res = await api.post(`/collections/${collectionId}/movies`, { movieId });
    return res.data;
  },
  removeMovie: async (collectionId, movieId) => {
    const res = await api.delete(`/collections/${collectionId}/movies/${movieId}`);
    return res.data;
  },
};
