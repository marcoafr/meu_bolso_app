import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import MultiAutoCompleteSelect from './MultiAutoCompleteSelect'; // Importe o MultiAutoCompleteSelect
import { categoryService } from '../api/categoryService';
import { useAuth } from '../authContext';

export interface CategoryDirectiveProps {
  multiple?: boolean; // Permitir múltiplas seleções (padrão: true)
  showOnlyReceiptOrExpense?: 'receipt' | 'expense'; // Filtrar por tipo (0: receipt, 1: expense)
  value: number | number[]; // Valor atual (ID ou IDs das categorias)
  onChange: (value: number | number[]) => void; // Callback para atualizar o valor
  includeTypeOnName?: boolean; // Incluir tipo da categoria no nome
}

const CategoryDirective: React.FC<CategoryDirectiveProps> = ({
  multiple = true,
  showOnlyReceiptOrExpense,
  value,
  onChange,
  includeTypeOnName = false,
}) => {
  const { user } = useAuth(); // Pegando o usuário autenticado
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.id) return;

    setLoading(true);
    setError(null);

    categoryService
      .getCategoriesByUserId(user.id) // Busca categorias pelo ID do usuário autenticado
      .then((data) => {
        let filteredCategories = data;

        // Aplica o filtro de tipo se necessário
        if (showOnlyReceiptOrExpense === 'receipt') {
          filteredCategories = filteredCategories.filter((cat: any) => cat.type === 0);
        } else if (showOnlyReceiptOrExpense === 'expense') {
          filteredCategories = filteredCategories.filter((cat: any) => cat.type === 1);
        }

        setCategories(filteredCategories);
      })
      .catch(() => {
        setError('Erro ao carregar categorias');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, showOnlyReceiptOrExpense]);

  // Função para obter o nome da categoria, considerando o tipo
  const getCategoryName = (category: any) => {
    if (includeTypeOnName) {
      return category.type === 0 ? `Receita: ${category.name}` : `Despesa: ${category.name}`;
    }
    return category.name;
  };

  // Se estiver carregando, exibe um indicador de carregamento
  if (loading) {
    return <CircularProgress />;
  }

  // Se houver erro, exibe uma mensagem de erro
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // Mapeia as categorias para o formato necessário pelo MultiAutoCompleteSelect
  const options = categories.map((category) => ({
    id: category.id,
    label: getCategoryName(category),
  }));

  const handleChange = (newValue: number | number[]) => {
    onChange(newValue);
  };

  return (
    <MultiAutoCompleteSelect
      value={value}
      onChange={handleChange}
      options={options}
      label="Categoria"
      multiple={multiple}
      getOptionLabel={(option) => option && option.label ? option.label : ""}
    />
  );
};

export default CategoryDirective;
