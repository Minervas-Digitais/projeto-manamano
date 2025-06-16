import axios from 'axios';
import { Platform } from 'react-native';

const api = axios.create({
  baseURL: Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000',

  validateStatus: (status) => status < 400,
});
export default api;
