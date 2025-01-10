import { useEffect, useState } from 'react';
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
  RadioGroup,
  Radio,
} from "@mui/material";
import CategoryDirective from '../directives/CategoryDirective';
import BankDirective from '../directives/BankDirective';
import { formatCurrency } from '../util/Util';
import CardDirective from '../directives/CardDirective';
import { useAuth } from '../authContext';

const RegisterTransaction = () => {
    const { user } = useAuth(); // Pegando o user do contexto de autenticação
  
  const [type, setType] = useState<'despesa' | 'receita'>('despesa');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState('unique'); // Valor inicial pode ser qualquer um
  const [recurrenceInterval, setRecurrenceInterval] = useState<string>('mensal');
  const [recurrenceQuantity, setRecurrenceQuantity] = useState<number>(2);
  const [category, setCategory] = useState<number>(0);
  const [bank, setBank] = useState<number>(0); // Tipar o estado como number | string
  const [card, setCard] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'banco' | 'cartao'>('banco');
  const [installments, setInstallments] = useState<number>(1);
  const [installmentValue, setInstallmentValue] = useState<number>(0);

  useEffect(() => {
    if (installments > 0 && totalAmount >= 0) {
      const calculatedInstallmentValue = totalAmount / installments;
      setInstallmentValue(Math.round(calculatedInstallmentValue * 100) / 100);  // Arredondando para 2 casas decimais
    }
  }, [totalAmount, installments]);

  const handleInstallmentsChange = (event) => {
    setInstallments(Number(event.target.value));
  };

  const handleSubmit = () => {
    // Lógica para enviar a transação ao backend
    const filter = {
      type,
      date,
      description,
      category,
      totalAmount,
      paymentType,

      // payment method: bank / card
      paymentMethod,
      bank,
      card,

      // installments
      installments,
      installmentValue,

      // recurrence
      recurrenceInterval,
      recurrenceQuantity,

      // userId
      userId: user?.id

    }
    console.log(filter);
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

        <FormControl fullWidth margin="normal">
          <CategoryDirective
            multiple={false} // Apenas uma categoria pode ser selecionada
            value={category} // Categoria atual do orçamento
            onChange={(newCategory) => {
              setCategory(Number(newCategory));
            }}
            includeTypeOnName={true} // Incluir "Despesa" ou "Receita" no nome
            showOnlyReceiptOrExpense={type === 'despesa' ? 'expense' : 'receipt'}
          />
        </FormControl>

        <TextField
          label="Valor Total (R$)"
          fullWidth
          type='number'
          value={totalAmount}
          onChange={(e) => {
            const value = e.target.value;
            // Limita a 2 casas decimais
            const formattedValue = parseFloat(parseFloat(value).toFixed(2));
            setTotalAmount(formattedValue);
          }}
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Forma de Pagamento</InputLabel>
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'banco' | 'cartao')}>
            <MenuItem value="banco">Banco</MenuItem>
            {type === 'despesa' && <MenuItem value="cartao">Cartão</MenuItem>}
          </Select>
        </FormControl>

        <h4>Froma de Pagamento</h4>

        <FormControl component="fieldset">
          <RadioGroup
            row
            value={paymentType} // Valor que vai controlar qual opção está selecionada
            onChange={(e) => setPaymentType(e.target.value)} // Atualiza o estado conforme a seleção
          >
            <FormControlLabel
              value="unique"
              control={<Radio />}
              label="Único"
            />
            <FormControlLabel
              value="installments"
              control={<Radio />}
              label="Parcelado"
            />
            <FormControlLabel
              value="recurring"
              control={<Radio />}
              label="Recorrente"
            />
          </RadioGroup>
        </FormControl>

        {paymentMethod === 'banco' && (
          <FormControl fullWidth margin="normal">
            <BankDirective
              value={bank}
              onChange={(newBankValue) => {
                setBank(Number(newBankValue));
              }}
              multiple={false} // Apenas uma seleção
            />
          </FormControl>
        )}
        {
          paymentMethod === 'cartao' && (
            <>
              <FormControl fullWidth margin="normal">
                <CardDirective
                  value={card}
                  onChange={(newCard) => {
                    setCard(Number(newCard));
                  }}
                  multiple={false}
                />
              </FormControl>
            </>
          )
        }
        {
          paymentType === "installments" && (
            <>
              <FormControl fullWidth margin="normal">

                <InputLabel id="installments-label">Número de Parcelas</InputLabel>
                <Select
                  labelId="installments-label"
                  value={installments}
                  onChange={handleInstallmentsChange}
                  label="Número de Parcelas"
                >
                  {Array.from({ length: 18 }, (_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {`${index + 1}x`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Valor da Parcela"
                value={formatCurrency(installmentValue)}
                fullWidth
                margin="normal"
                disabled={true}
              />
            </>
          )
        }

        {paymentType === "recurring" && (
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
    
        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          {type === 'despesa' ? 'Lançar Despesa' : 'Lançar Receita'}
        </Button>
      </Box>
    </Container>
  );
};

export default RegisterTransaction;
