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

// Função para formatar um objeto {year, month, day} para o formato 'yyyy-MM-dd'
export const formatLocalDate = (date: { year: number, month: number, day: number }): string => {
  if (!date || typeof date.year !== 'number' || typeof date.month !== 'number' || typeof date.day !== 'number') {
    return '';  // Retorna string vazia se o objeto não for válido
  }

  // Formata para 'yyyy-MM-dd'
  const year = date.year;
  const month = (date.month).toString().padStart(2, '0');  // Ajusta para ter dois dígitos
  const day = (date.day).toString().padStart(2, '0');  // Ajusta para ter dois dígitos

  return `${year}-${month}-${day}`;
};