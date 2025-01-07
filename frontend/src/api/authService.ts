import axiosInstance from "./axiosConfig";

// Método de login
export const login = async (login: string, password: string) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      login,
      password,
    });

    return response.data;  // Supondo que a resposta contenha um campo "token"
  } catch (error) {
    // Lança o erro com a resposta se o código de status for 401 ou qualquer outro erro
    throw error;
  }
};

// Método de logout
export const logout = () => {
  // Limpa o token (assumindo que você está armazenando no sessionStorage)
  sessionStorage.removeItem('token');
};