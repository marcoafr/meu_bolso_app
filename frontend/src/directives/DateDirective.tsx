import React, { useState } from 'react';
import { TextField, Grid } from '@mui/material';

interface DateDirectiveProps {
  onChange: (dates: { from: string | null; to: string | null }) => void;
}

const DateDirective: React.FC<DateDirectiveProps> = ({ onChange }) => {
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
    onChange({ from: e.target.value, to: toDate });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
    onChange({ from: fromDate, to: e.target.value });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          type="date"
          label="Data de Competência (De)"
          fullWidth
          value={fromDate || ''}
          onChange={handleFromChange}
          inputProps={{
            max: toDate || undefined,
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          type="date"
          label="Data de Competência (Até)"
          fullWidth
          value={toDate || ''}
          onChange={handleToChange}
          inputProps={{
            min: fromDate || undefined,
          }}
        />
      </Grid>
    </Grid>
  );
};

export default DateDirective;
