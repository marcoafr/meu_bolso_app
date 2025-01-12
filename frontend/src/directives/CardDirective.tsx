import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import MultiAutoCompleteSelect from './MultiAutoCompleteSelect'; // Importe o MultiAutoCompleteSelect
import { creditCardService } from '../api/creditCardService'; // Importando o serviço de cartões de crédito
import { useAuth } from '../authContext';

interface CardDirectiveProps {
  multiple?: boolean; // Permitir múltiplas seleções (padrão: true)
  value: number | number[]; // Valor atual (ID ou IDs dos cartões de crédito)
  onChange: (value: number | number[]) => void; // Callback para atualizar o valor
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

  // Se não estiver carregando e não houver erro, renderize o MultiAutoCompleteSelect
  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  const options = creditCards.map((card) => ({
    id: card.id,
    label: card.name,
  }));

  const handleChange = (newValue: number | number[]) => {
    // Lida com a mudança, garantindo que o valor esteja no formato esperado
    onChange(newValue);
  };

  return (
    <MultiAutoCompleteSelect
      value={value}
      onChange={handleChange}
      options={options}
      label="Cartão de Crédito"
      multiple={multiple}
    />
  );
};

export default CardDirective;
