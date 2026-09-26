import api from './client';

export const statsApi = {
  getStatistics: async () => {
    const res = await api.get('/statistics');
    return res.data;
  },
};

export const preferencesApi = {
  getPreferences: async () => {
    const res = await api.get('/preferences');
    return res.data;
  },
  updatePreferences: async (data) => {
    const res = await api.put('/preferences', data);
    return res.data;
  },
};

export const dataApi = {
  exportJsonUrl: '/api/data/export/json',
  exportCsvUrl: '/api/data/export/csv',
  importJson: async (movies) => {
    const res = await api.post('/data/import/json', { movies });
    return res.data;
  },
};
