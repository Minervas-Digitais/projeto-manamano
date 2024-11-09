import api from '../api';

export default {
  async getDetails(token: string) {
    try {
      const response = await api.get('/private/getDetails', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (e) {
      console.error(e);
      return e;
    }
  },
};
