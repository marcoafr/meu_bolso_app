import axiosInstance from "./axiosConfig";

const dashboardService = {
  currentBalance: async (userId: any) => {
    try {
      const response = await axiosInstance.post('/dashboard/currentBalance', userId);
      return response.data;  // Retorna os dados dos categorias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  bankTransfer: async (filter: any) => {
    try {
      const response = await axiosInstance.post('/dashboard/bankTransfer', filter);
      return response.data;  // Retorna os dados dos categorias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  heritageEvolution: async (filter: any) => {
    try {
      const response = await axiosInstance.post('/dashboard/heritageEvolution', filter);
      return response.data;  // Retorna os dados dos categorias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },
};

export { dashboardService };