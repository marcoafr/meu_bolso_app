import axiosInstance from "./axiosConfig";

const createTransactionService = {
  mountTransaction: async (transactionDTO: any) => {
    try {
      const response = await axiosInstance.post('/create-transaction/mount-transaction', transactionDTO);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados dos categorias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },
};

export { createTransactionService };