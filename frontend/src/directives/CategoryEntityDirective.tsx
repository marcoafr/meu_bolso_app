import React, { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../api/categoryService';
import { useAuth } from '../authContext';
import MultiAutoCompleteEntitySelect from './MultiAutoCompleteEntitySelect';

interface CategoryEntityDirectiveProps {
  multiple?: boolean;
  showOnlyReceiptOrExpense?: "receipt" | "expense";
  value: any | any[];
  onChange: (value: any | any[]) => void;
  includeTypeOnName?: boolean;
}

const CategoryEntityDirective: React.FC<CategoryEntityDirectiveProps> = ({
  multiple = true,
  showOnlyReceiptOrExpense,
  value,
  onChange,
  includeTypeOnName = false,
}) => {
  const { user } = useAuth();
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async (): Promise<void> => {
    if (!user || !user.id) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const categories = await categoryService.getCategoriesByUserId(user.id);

      let filteredCategories = categories;
      if (showOnlyReceiptOrExpense === "receipt") {
        filteredCategories = categories.filter((category) => category.type === 0);
      } else if (showOnlyReceiptOrExpense === "expense") {
        filteredCategories = categories.filter((category) => category.type === 1);
      }

      setOptions(filteredCategories); // Atualiza as opções
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  }, [user, showOnlyReceiptOrExpense]);

  useEffect(() => {
    fetchCategories(); // Chama a função para buscar as categorias ao carregar o componente
  }, [fetchCategories]);

  const getCategoryLabel = (category: any) => {
    if (includeTypeOnName) {
      return category.type === 0
        ? `Receita: ${category.name}`
        : `Despesa: ${category.name}`;
    }
    return category.name;
  };

  const handleCategoryChange = (newValue: any) => {
    onChange(newValue); // Se múltiplo, passa a lista de objetos de categoria
  };

  return (
    <MultiAutoCompleteEntitySelect
      value={multiple ? value : options.find((option) => option.id === value)} // Passa o objeto completo ou null
      onChange={handleCategoryChange}
      options={options}
      label="Categoria"
      multiple={multiple}
      getOptionLabel={getCategoryLabel}
      loading={loading}
    />
  );
};

export default CategoryEntityDirective;
