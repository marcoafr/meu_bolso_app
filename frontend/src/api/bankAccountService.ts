import axiosInstance from "./axiosConfig";

const bankAccountService = {
  // Função para buscar contas bancárias por userId
  getBankAccountsByUserId: async (userId: string) => {
    try {
      const response = await axiosInstance.post('/bank-accounts/search', userId);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados das contas bancárias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  }
};

export { bankAccountService };