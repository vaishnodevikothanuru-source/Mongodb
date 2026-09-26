import api from './client';

export const moviesApi = {
  getMovies: async (params = {}) => {
    const res = await api.get('/movies', { params });
    return res.data;
  },
  getMovieById: async (id) => {
    const res = await api.get(`/movies/${id}`);
    return res.data;
  },
  createMovie: async (movieData) => {
    const res = await api.post('/movies', movieData);
    return res.data;
  },
  updateMovie: async (id, movieData) => {
    const res = await api.put(`/movies/${id}`, movieData);
    return res.data;
  },
  deleteMovie: async (id) => {
    const res = await api.delete(`/movies/${id}`);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/movies/${id}/status`, { status });
    return res.data;
  },
  toggleFavorite: async (id) => {
    const res = await api.patch(`/movies/${id}/favorite`);
    return res.data;
  },
  updateRating: async (id, personalRating) => {
    const res = await api.patch(`/movies/${id}/rating`, { personalRating });
    return res.data;
  },
  updateReview: async (id, reviewData) => {
    const res = await api.patch(`/movies/${id}/review`, reviewData);
    return res.data;
  },
};
