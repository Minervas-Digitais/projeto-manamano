import axios from 'axios';
import { Platform } from 'react-native';

const api = axios.create({
  baseURL: 'http://192.168.0.80:3000',
  validateStatus: (status) => status < 400,
});
export default api;
