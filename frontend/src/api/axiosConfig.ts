import axios from 'axios';

// Definindo a configuração global do axios
const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8080/api',  // Ajuste conforme o seu backend
  // baseURL: 'http://103.199.186.65:8080/api',  // Ajuste conforme o seu backend
  baseURL: 'https://meubolso.tech/api',  // Ajuste conforme o seu backend
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': '*', // Adiciona o cabeçalho de permissão
  },
});

// Interceptor para adicionar o token no cabeçalho Authorization
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;