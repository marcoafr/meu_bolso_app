import React from 'react';
import { TextField, MenuItem } from '@mui/material';

interface TransactionTypeFilterProps {
  value: number;
  onChange: (value: number) => void;
}

const TransactionTypeFilter: React.FC<TransactionTypeFilterProps> = ({ value, onChange }) => {
  return (
    <TextField
      select
      label="Tipo de Transação"
      fullWidth
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <MenuItem value={0}>Receita</MenuItem>
      <MenuItem value={1}>Despesa</MenuItem>
    </TextField>
  );
};

export default TransactionTypeFilter;
