import axiosInstance from "./axiosConfig";

const creditCardService = {
  // Função para buscar cartões de crédito por userId
  getCreditCardsByUserId: async (userId: string) => {
    try {
      const response = await axiosInstance.post('/credit-cards/search', userId);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados das cartões de crédito
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

   // Função para adicionar uma nova cartão de crédito
   addCreditCard: async (creditCardData) => {
    try {
      const response = await axiosInstance.post('/credit-cards/add', creditCardData); // Requisição POST para adicionar
      return response.data; // Retorna os dados da cartão de crédito criada
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
    }
  },
  
  // Função para editar uma cartão de crédito existente
  editCreditCard: async (creditCardData) => {
    try {
      const response = await axiosInstance.post('/credit-cards/edit', creditCardData); // Requisição POST para editar
      return response.data; // Retorna os dados da cartão de crédito atualizada
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
   }
  },
  
  // Função para coletar informações da fatura de um cartão de crédito existente
  summarizedInfo: async (filter) => {
    try {
      const response = await axiosInstance.post('/credit-cards/summarized-info', filter); // Requisição POST para editar
      return response.data; // Retorna os dados da cartão de crédito atualizada
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
   }
  }
};

export { creditCardService };