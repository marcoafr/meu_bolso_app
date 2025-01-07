import axios from 'axios';

// Definindo a configuração global do axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',  // Ajuste conforme o seu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;