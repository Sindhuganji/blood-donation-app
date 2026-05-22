import axios from 'axios';

const api = axios.create({
  baseURL: "http://10.161.29.206:5000/api", // laptop IP, NOT localhost
  timeout: 10000,
});

export default api;
