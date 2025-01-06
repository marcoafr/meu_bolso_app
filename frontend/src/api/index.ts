import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export const login = async (login: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login", {
      login,
      password,
    });

    return response.data; // Supondo que a resposta contenha um campo "token"
  } catch (error) {
    // Lança o erro com a resposta se o código de status for 401 ou qualquer outro erro
    throw error;
  }
};

export const logout = () => {
  // Clear the token here
  sessionStorage.removeItem('token');
};

