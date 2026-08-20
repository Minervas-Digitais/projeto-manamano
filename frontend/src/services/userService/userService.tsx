import api from '../api';

export default {
  async getDetails() {
    try {
      const response = await api.get('/private/getDetails');
      return response;
    } catch (e) {
      console.error(e);
      return e;
    }
  },
};