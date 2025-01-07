// Função para formatar valores como moeda (R$)
export const formatCurrency = (value: number): string => {
    if (isNaN(value)) {
      return 'R$ 0,00';  // Retorna "R$ 0,00" se o valor não for válido
    }
  
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  