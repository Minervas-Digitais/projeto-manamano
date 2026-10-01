import api from '../api';

export default {
  async getDetails() {
    try {
      const response = await api.get('/private/getDetails');
      return response;
    } catch (e) {
      return e;
    }
  },
};
