import api from './api';

export const textService = {
  async getRandomText(language = 'javascript') {
    const response = await api.get('/texts/random', {
      params: { language }
    });
    return response.data.text;
  },

  async getTextById(id) {
    const response = await api.get(`/texts/${id}`);
    return response.data.text;
  },
};

