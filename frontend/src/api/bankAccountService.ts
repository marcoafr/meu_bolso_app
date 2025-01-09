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
  },

  // Função para adicionar uma nova conta bancária
  addBankAccount: async (bankAccountData) => {
    try {
      const response = await axiosInstance.post('/bank-accounts/add', bankAccountData); // Requisição POST para adicionar
      return response.data; // Retorna os dados da conta bancária criada
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
    }
  },
  
  // Função para editar uma conta bancária existente
  editBankAccount: async (bankAccountData) => {
    try {
      const response = await axiosInstance.post('/bank-accounts/edit', bankAccountData); // Requisição POST para editar
      return response.data; // Retorna os dados da conta bancária atualizada
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
   }
  }
};

export { bankAccountService };