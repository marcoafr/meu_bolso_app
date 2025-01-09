import axiosInstance from "./axiosConfig";

const categoryBudgetService = {
  // Função para buscar orçamentos por userId
  getCategoryBudgetsByUserId: async (userId: string) => {
    try {
      const response = await axiosInstance.post('/category-budgets/search', userId);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados dos orçamentos
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  // Função para adicionar um novo orçamento
  addCategoryBudget: async (categoryBudgetData) => {
    try {
      const response = await axiosInstance.post('/category-budgets/add', categoryBudgetData); // Requisição POST para adicionar
      return response.data; // Retorna os dados do orçamento criado
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
    }
  },
  
  // Função para editar um orçamento existente
  editCategoryBudget: async (categoryBudgetData) => {
    try {
      const response = await axiosInstance.post('/category-budgets/edit', categoryBudgetData); // Requisição POST para editar
      return response.data; // Retorna os dados do orçamento atualizado
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
   }
  }
};

export { categoryBudgetService };