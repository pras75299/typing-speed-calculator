import api from './api';

export const sessionService = {
  async createSession(textId) {
    const response = await api.post('/sessions', { textId });
    return response.data.session;
  },

  async getSessions(limit = 20, offset = 0) {
    const response = await api.get('/sessions', {
      params: { limit, offset },
    });
    return response.data;
  },

  async updateSession(sessionId, data) {
    const response = await api.patch(`/sessions/${sessionId}`, data);
    return response.data.session;
  },
};

