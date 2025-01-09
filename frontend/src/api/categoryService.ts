import axiosInstance from "./axiosConfig";

const categoryService = {
  // Função para buscar cartões de crédcategoriasitos por userId
  getCategoriesByUserId: async (userId: string) => {
    try {
      const response = await axiosInstance.post('/categories/search', userId);  // Fazendo a requisição POST com userId no corpo
      return response.data;  // Retorna os dados dos categorias
    } catch (error) {
      throw error;  // Lança o erro para ser tratado no componente
    }
  },

  // Função para adicionar um novo categoria
  addCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post('/categories/add', categoryData); // Requisição POST para adicionar
      return response.data; // Retorna os dados do categoria criado
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
    }
  },
  
  // Função para editar um categoria existente
  editCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post('/categories/edit', categoryData); // Requisição POST para editar
      return response.data; // Retorna os dados do categoria atualizado
    } catch (error) {
      throw error; // Lança o erro para ser tratado no componente
   }
  }
};

export { categoryService };