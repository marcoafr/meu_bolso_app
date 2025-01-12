import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

interface TransactionTypeDirectiveProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const TransactionTypeDirective: React.FC<TransactionTypeDirectiveProps> = ({ value, onChange }) => {
  return (
    <Autocomplete
      value={value !== null ? value : null} // Verifica se o valor é null
      onChange={(_, newValue) => onChange(newValue)} // Passa null para limpar
      options={[0, 1]} // Os valores possíveis
      getOptionLabel={(option) => (option === 0 ? 'Receita' : 'Despesa')}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tipo de Transação"
          fullWidth
        />
      )}
      isOptionEqualToValue={(option, value) => option === value} // Compara as opções
    />
  );
};

export default TransactionTypeDirective;
