import axiosInstance from "./axiosConfig";

const receivableService = {
  // Função para buscar contas bancárias por userId
  getAnalyticalListReceivableByUserId: async (receivablesDTO: string) => {
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
};

export { receivableService };