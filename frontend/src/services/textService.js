import api from './api';

export const textService = {
  async getRandomText() {
    const response = await api.get('/texts/random');
    return response.data.text;
  },

  async getTextById(id) {
    const response = await api.get(`/texts/${id}`);
    return response.data.text;
  },
};

