import axios from "axios";

const API_BASE_URL = "https://localhost:7028/api";
const API_KEY = 12345

const apiClient = axios.create({
  baseURL: API_BASE_URL, // Usa variables de entorno
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ApiKey': API_KEY
  },
});

export default apiClient;