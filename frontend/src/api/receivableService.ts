import axiosInstance from "./axiosConfig";

const receivableService = {
  // Função para buscar contas bancárias por userId
  getAnalyticalListReceivableByUserId: async (receivablesDTO) => {
    try {
      const response = await axiosInstance.post('/receivables/searchAnalytical', receivablesDTO);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados das contas bancárias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  // Função para Liquidar
  liquidate: async (liquidationDto) => {
    try {
      const response = await axiosInstance.post('/receivables/liquidate', liquidationDto);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados das contas bancárias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  // Função para editar transação
  updateReceivable: async (editionDto) => {
    try {
      const response = await axiosInstance.post('/receivables/updateReceivable', editionDto);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados das contas bancárias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  // Função para cancelar transação
  cancelReceivable: async (id) => {
    try {
      const response = await axiosInstance.post('/receivables/cancelReceivable', id);  // Fazendo a requisição DELETE com userId no corpo
      return response.data;  // Retorna os dados das contas bancárias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  // Função para deletar transação
  deleteReceivable: async (id) => {
    try {
      const response = await axiosInstance.post('/receivables/deleteReceivable', id);  // Fazendo a requisição DELETE com userId no corpo
      return response.data;  // Retorna os dados das contas bancárias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },
  
  // Função para buscar receivables por categoria
  receivablesByMonth: async (filter) => {
    try {
      const response = await axiosInstance.post('/receivables/receivablesByMonth', filter);  
      return response.data; 
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  }
};

export { receivableService };