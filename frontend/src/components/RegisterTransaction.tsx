import React, { useEffect, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from "@mui/material";

const RegisterTransaction = () => {
  const [type, setType] = useState<'despesa' | 'receita'>('despesa');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<string>('mensal');
  const [recurrenceQuantity, setRecurrenceQuantity] = useState<number>(2);
  const [category, setCategory] = useState<string>('');
  const [bank, setBank] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'banco' | 'cartao'>('banco');
  const [installments, setInstallments] = useState<number>(1);
  const [installmentValue, setInstallmentValue] = useState<number>(0);

  // Listas de dados de exemplo para bancos e categorias
  const banks = ['Banco A', 'Banco B', 'Banco C'];
  const categories = ['Categoria 1', 'Categoria 2'];

  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Garantir que o valor seja um número com no máximo 2 casas decimais
    if (/^\d+(\.\d{0,2})?$/.test(value)) {
      setTotalAmount(parseFloat(value));
    }
  };

  const handleInstallmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setInstallments(value);
    }
  };

  useEffect(() => {
    if (installments > 0 && totalAmount >= 0) {
      const calculatedInstallmentValue = totalAmount / installments;
      setInstallmentValue(Math.round(calculatedInstallmentValue * 100) / 100);  // Arredondando para 2 casas decimais
    }
  }, [totalAmount, installments]);

  const handleSubmit = () => {
    // Lógica para enviar a transação ao backend
    console.log({
      type,
      date,
      description,
      totalAmount,
      isRecurring,
      recurrenceInterval,
      recurrenceQuantity,
      category,
      bank,
      paymentMethod,
      installments,
      installmentValue,
    });
  };

  return (
    <Container>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Registrar Transação
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo</InputLabel>
          <Select value={type} onChange={(e) => setType(e.target.value as 'despesa' | 'receita')}>
            <MenuItem value="despesa">Despesa</MenuItem>
            <MenuItem value="receita">Receita</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Data de Emissão"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
            label="Valor Total"
            value={totalAmount.toFixed(2)}
            onChange={handleTotalAmountChange}
            fullWidth
            margin="normal"
            InputProps={{
            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
            inputProps={{
            step: "0.01",  // Define o passo para 2 casas decimais
            min: "0",      // Garante que o número não seja negativo
            }}
        />

        <FormControlLabel
          control={
            <Checkbox checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
          }
          label="Transação Recorrente?"
        />

        {isRecurring && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Intervalo de Recorrência</InputLabel>
              <Select value={recurrenceInterval} onChange={(e) => setRecurrenceInterval(e.target.value)}>
                <MenuItem value="mensal">Mensal</MenuItem>
                <MenuItem value="quinzenal">Quinzenal</MenuItem>
                <MenuItem value="semanal">Semanal</MenuItem>
                <MenuItem value="diario">Diário</MenuItem>
                <MenuItem value="anual">Anual</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Quantidade de Recorrência"
              type="number"
              value={recurrenceQuantity}
              onChange={(e) => setRecurrenceQuantity(Math.min(36, Math.max(2, parseInt(e.target.value))))}
              fullWidth
              margin="normal"
              inputProps={{ min: 2, max: 36 }}
            />
          </>
        )}

        {type === 'receita' && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Banco</InputLabel>
              <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                {banks.map((bankOption, index) => (
                  <MenuItem key={index} value={bankOption}>
                    {bankOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Categoria</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((categoryOption, index) => (
                  <MenuItem key={index} value={categoryOption}>
                    {categoryOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        {type === 'despesa' && (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Forma de Pagamento</InputLabel>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'banco' | 'cartao')}>
                <MenuItem value="banco">Banco</MenuItem>
                <MenuItem value="cartao">Cartão</MenuItem>
              </Select>
            </FormControl>

            {paymentMethod === 'banco' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Banco</InputLabel>
                <Select value={bank} onChange={(e) => setBank(e.target.value)}>
                  {banks.map((bankOption, index) => (
                    <MenuItem key={index} value={bankOption}>
                      {bankOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {paymentMethod === 'cartao' && (
              <>
                <TextField
                  label="Número de Parcelas"
                  type="number"
                  value={installments}
                  onChange={handleInstallmentsChange}
                  fullWidth
                  margin="normal"
                  inputProps={{ min: 1, max: 18 }}
                  disabled={isRecurring}
                />

                <TextField
                    label="Valor da Parcela"
                    value={`R$ ${installmentValue.toFixed(2)}`}
                    fullWidth
                    margin="normal"
                    InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    readOnly: true,
                    }}
                />
              </>
            )}
          </>
        )}

        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          {type === 'despesa' ? 'Lançar Despesa' : 'Lançar Receita'}
        </Button>
      </Box>
    </Container>
  );
};

export default RegisterTransaction;
