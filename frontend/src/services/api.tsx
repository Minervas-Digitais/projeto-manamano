import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  validateStatus: (status) => status < 400,
});
export default api;
