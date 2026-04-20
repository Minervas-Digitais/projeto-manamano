import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  validateStatus: (status) => status < 400,
});
export default api;
