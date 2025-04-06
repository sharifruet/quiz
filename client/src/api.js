// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Match your backend URL
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;