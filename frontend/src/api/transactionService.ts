import axiosInstance from "./axiosConfig";

const transactionService = {
  batchInsert: async (transactionListDTO: any) => {
    try {
      const response = await axiosInstance.post('/transactions/batch-insert', transactionListDTO);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados dos categorias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },
};

export { transactionService };