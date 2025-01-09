import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, CircularProgress } from '@mui/material';
import { categoryService } from '../api/categoryService';
import { useAuth } from '../authContext';

interface CategoryDirectiveProps {
    multiple?: boolean; // Permitir múltiplas seleções (padrão: true)
    showOnlyReceiptOrExpense?: 'receipt' | 'expense'; // Filtrar por tipo (0: receipt, 1: expense)
    value: string | string[] | number | number[]; // Valor atual (ID ou IDs das categorias)
    onChange: (value: string | string[]) => void; // Callback para atualizar o valor
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
  
    const getDisplayValue = () => {
      if (multiple && Array.isArray(value)) {
        return categories
          .filter((category) => value.includes(category.id))
          .map((category) => category.name)
          .join(', ');
      } else if (!multiple && typeof value === 'string') {
        const category = categories.find((category) => category.id === value);
        return category ? category.name : '';
      } else if (!multiple && typeof value === 'number') {
        const category = categories.find((category) => category.id === value);
        return category ? category.name : '';
      }
      return '';
    };
  
    if (loading) {
      return <CircularProgress />;
    }
  
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }
  
    const handleChange = (e: React.ChangeEvent<{ value: any }>) => {
      const selectedValue = e.target.value;
      if (multiple) {
        const updatedValue = Array.isArray(value)
          ? [...value, selectedValue.toString()]
          : [selectedValue.toString()];
        onChange(updatedValue);
      } else {
        onChange(selectedValue.toString());
      }
    };

    const getCategoryName = (category: any) => {
        if (includeTypeOnName) {
          return category.type === 0 ? `Receita: ${category.name}` : `Despesa: ${category.name}`;
        }
        return category.name;
    };  
  
    return (
      <TextField
        select
        fullWidth
        label="Categoria"
        value={value}
        onChange={handleChange}
        SelectProps={{
          multiple: multiple,
          renderValue: getDisplayValue, // Exibe os nomes das categorias no TextField
        }}
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {getCategoryName(category)}
          </MenuItem>
        ))}
      </TextField>
    );
};
  
export default CategoryDirective;
