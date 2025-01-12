import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import MultiAutoCompleteSelect  from './MultiAutoCompleteSelect'; // Supondo que o componente MultiAutoCompleteSelect esteja no caminho correto
import { bankAccountService } from '../api/bankAccountService'; // Importando o serviço
import { useAuth } from '../authContext';

interface BankDirectiveProps {
  multiple?: boolean; // Permitir múltiplas seleções (padrão: true)
  value: number | number[]; // Valor atual (ID ou IDs das contas bancárias)
  onChange: (value: number | number[]) => void; // Callback para atualizar o valor
}

const BankDirective: React.FC<BankDirectiveProps> = ({
  multiple = true,
  value,
  onChange,
}) => {
  const { user } = useAuth(); // Pegando o usuário autenticado
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.id) return;

    setLoading(true);
    setError(null);

    bankAccountService
      .getBankAccountsByUserId(user.id) // Busca contas bancárias pelo ID do usuário autenticado
      .then((data) => {
        setBankAccounts(data);
      })
      .catch(() => {
        setError('Erro ao carregar contas bancárias');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  const handleChange = (newValue: number | number[]) => {
    if (multiple) {
      // Garante que sempre será um array de números
      onChange(newValue);
    } else {
      onChange(newValue);
    }
  };

  // Mapeando as contas bancárias para o formato esperado pelo MultiAutoCompleteSelect
  const options = bankAccounts.map((account) => ({
    id: account.id,
    label: account.name,
  }));

  return (
    <MultiAutoCompleteSelect
      value={value}
      multiple={multiple}
      onChange={handleChange}
      options={options} // Passa as opções mapeadas
      label="Conta Bancária"
      getOptionLabel={(option) => option.label} // Função para exibir o nome da conta
    />
  );
};

export default BankDirective;
