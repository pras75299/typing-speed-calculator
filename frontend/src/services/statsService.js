import api from './api';

export const statsService = {
  async getUserStats() {
    const response = await api.get('/stats/user');
    return response.data.statistics || response.data;
  },

  async getDetailedStats() {
    const response = await api.get('/stats/user/detailed');
    return response.data;
  },

  async getLeaderboard(limit = 50) {
    const response = await api.get('/stats/leaderboard', {
      params: { limit },
    });
    return response.data.leaderboard;
  },

  async getSessionHistory(limit = 20, offset = 0) {
    const response = await api.get('/stats/user/history', {
      params: { limit, offset },
    });
    return response.data;
  },

  async getProgressOverTime(days = 30) {
    const response = await api.get('/stats/user/progress', {
      params: { days },
    });
    return response.data;
  },
};

