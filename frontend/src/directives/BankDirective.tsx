import React, { useEffect, useState } from 'react';
import { TextField, MenuItem, CircularProgress } from '@mui/material';
import { bankAccountService } from '../api/bankAccountService'; // Importando o serviço
import { useAuth } from '../authContext';

interface BankDirectiveProps {
  multiple?: boolean; // Permitir múltiplas seleções (padrão: true)
  value: string | string[] | number | number[]; // Valor atual (ID ou IDs das contas bancárias)
  onChange: (value: string | string[]) => void; // Callback para atualizar o valor
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

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      return bankAccounts
        .filter((account) => value.includes(account.id))
        .map((account) => account.name)
        .join(', ');
    } else if (!multiple && typeof value === 'string') {
      const account = bankAccounts.find((account) => account.id === value);
      return account ? account.name : '';
    } else if (!multiple && typeof value === 'number') {
      const account = bankAccounts.find((account) => account.id === value);
      return account ? account.name : '';
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
      label="Conta Bancária"
      value={value}
      onChange={handleChange}
      SelectProps={{
        multiple: multiple,
        renderValue: getDisplayValue, // Exibe os nomes das contas bancárias no TextField
      }}
    >
      {bankAccounts.map((account) => (
        <MenuItem key={account.id} value={account.id}>
          {account.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default BankDirective;
