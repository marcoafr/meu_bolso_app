import React, { useCallback, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { creditCardService } from '../api/creditCardService';
import { useAuth } from '../authenticationContext';
import MultiAutoCompleteEntitySelect from './MultiAutoCompleteEntitySelect';

interface CardEntityDirectiveProps {
  multiple?: boolean;
  value: any | any[];
  onChange: (value: any | any[]) => void;
}

const CardEntityDirective: React.FC<CardEntityDirectiveProps> = ({
  multiple = true,
  value,
  onChange,
}) => {
  const { user } = useAuth();
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditCards = useCallback(async (): Promise<void> => {
    if (!user || !user.id) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const creditCards = await creditCardService.getCreditCardsByUserId(user.id);
      setOptions(creditCards);
    } catch (error) {
      setError('Erro ao carregar cartões de crédito');
      console.error('Erro ao carregar cartões de crédito:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCreditCards();
  }, [fetchCreditCards]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  // Define a lógica para renderizar as opções
  const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: any) => (
    <li {...props}>
      <span
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          backgroundColor: option.color || '#000',
          borderRadius: 4,
          marginRight: 8,
        }}
      ></span>
      {option.name}
    </li>
  );

  return (
    <MultiAutoCompleteEntitySelect
      value={multiple ? value : options.find((option) => option.id === value?.id) || null}
      onChange={handleChange}
      options={options}
      label="Cartão de Crédito"
      multiple={multiple}
      getOptionLabel={(option) => option.name || ''}
      renderOption={renderOption} // Passa a lógica de renderização personalizada
    />
  );
};

export default CardEntityDirective;
