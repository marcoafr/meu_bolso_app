import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, CircularProgress } from '@mui/material';
import { creditCardService } from '../api/creditCardService'; // Importando o serviço de cartões de crédito
import { useAuth } from '../authContext';

interface CardDirectiveProps {
  multiple?: boolean; // Permitir múltiplas seleções (padrão: true)
  value: string | string[] | number | number[]; // Valor atual (ID ou IDs dos cartões de crédito)
  onChange: (value: string | string[]) => void; // Callback para atualizar o valor
}

const CardDirective: React.FC<CardDirectiveProps> = ({
  multiple = true,
  value,
  onChange,
}) => {
  const { user } = useAuth(); // Pegando o usuário autenticado
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.id) return;

    setLoading(true);
    setError(null);

    creditCardService
      .getCreditCardsByUserId(user.id) // Busca cartões de crédito pelo ID do usuário autenticado
      .then((data) => {
        setCreditCards(data);
      })
      .catch(() => {
        setError('Erro ao carregar cartões de crédito');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      return creditCards
        .filter((card) => value.includes(card.id))
        .map((card) => card.name)
        .join(', ');
    } else if (!multiple && typeof value === 'string') {
      const card = creditCards.find((card) => card.id === value);
      return card ? card.name : '';
    } else if (!multiple && typeof value === 'number') {
      const card = creditCards.find((card) => card.id === value);
      return card ? card.name : '';
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

  return (
    <TextField
      select
      fullWidth
      label="Cartão de Crédito"
      value={value}
      onChange={handleChange}
      SelectProps={{
        multiple: multiple,
        renderValue: getDisplayValue, // Exibe os nomes dos cartões de crédito no TextField
      }}
    >
      {creditCards.map((card) => (
        <MenuItem key={card.id} value={card.id}>
          {card.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default CardDirective;
