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
import { createTransactionService } from '../api/createTransactionService';
import { useSnackbar } from '../directives/snackbar/SnackbarContext';
import TransactionsReceivablesModal from './TransactionsReceivablesModal';

const RegisterTransaction = () => {
  const { user } = useAuth(); // Pegando o user do contexto de autenticação
  const { showSnackbar } = useSnackbar(); // Usando o hook do Snackbar
  
  const [type, setType] = useState<'despesa' | 'receita'>('despesa');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'unique' | 'installments' | 'recurring'>('unique'); // Valor inicial pode ser qualquer um
  const [recurrenceInterval, setRecurrenceInterval] = useState<'diario' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' >('mensal');
  const [recurrenceQuantity, setRecurrenceQuantity] = useState<number>(2);
  const [category, setCategory] = useState<number>(0);
  const [bank, setBank] = useState<number>(0); // Tipar o estado como number | string
  const [card, setCard] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'banco' | 'cartao'>('banco');
  const [installments, setInstallments] = useState<number>(2);
  const [installmentValue, setInstallmentValue] = useState<number>(0);

  // Modal de Confirmação
  const [creationTransactions, setCreationTransactions]= useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (installments > 0 && totalAmount >= 0) {
      const calculatedInstallmentValue = totalAmount / installments;
      setInstallmentValue(Math.round(calculatedInstallmentValue * 100) / 100);  // Arredondando para 2 casas decimais
    }
  }, [totalAmount, installments]);

  const handleInstallmentsChange = (event) => {
    setInstallments(Number(event.target.value));
  };

  const validateFilters = () => {
    if (type == null || (type != 'despesa' && type != 'receita')) {
      showSnackbar("Tipo de transação é obrigatório (Despesa ou Receita)", "warning");
      return false
    }
    if (date == null) {
      showSnackbar("Data de emissão é obrigatória", "warning");
      return false
    }
    if (description == null || description == '') {
      showSnackbar("Descrição é obrigatória", "warning");
      return false
    }
    if (category == null || category <= 0) {
      showSnackbar("Categoria é obrigatória", "warning");
      return false
    }
    if (totalAmount == null || totalAmount <= 0) {
      showSnackbar("Valor Total (R$) é obrigatório", "warning");
      return false
    }
    if (paymentMethod == null || (paymentMethod !== 'banco' && paymentMethod !== 'cartao')) {
      showSnackbar("Forma de Pagamento é obrigatório (Banco ou Cartão)", "warning");
      return false
    }

    if (paymentType == null || (paymentType !== 'unique' && paymentType !== 'installments' && paymentType !== 'recurring')) {
      showSnackbar("Modalidade de Pagamento é obrigatório (Único, Parcelado ou Recorrente)", "warning");
      return false
    }

    if (paymentMethod === 'banco' && (bank == null || bank <= 0)) {
      showSnackbar("Conta Bancária é obrigatória para Forma de Pagamento: Banco", "warning");
      return false
    }
    if (paymentMethod === 'cartao' && (card == null || card <= 0)) {
      showSnackbar("Cartão de Crédito é obrigatório para Forma de Pagamento: Cartão", "warning");
      return false
    }

    if (paymentType === 'installments') {
      if (installments == null || installments <= 0) {
        showSnackbar("Número de Parcelas é obrigatório para Modalidade de Pagamento: Parcelado", "warning");
        return false
      }
    }

    if (paymentType === 'recurring') {
      if (recurrenceInterval == null || (recurrenceInterval !== 'diario' && recurrenceInterval !== 'semanal' && recurrenceInterval !== 'quinzenal' && recurrenceInterval !== 'mensal' && recurrenceInterval !== 'anual')) {
        showSnackbar("Intervalo de Recorrência é obrigatório para Modalidade de Pagamento: Recorrente", "warning");
        return false
      }
      if (recurrenceInterval == null || recurrenceQuantity <= 0) {
        showSnackbar("Quantidade de Recorrência é obrigatório para Modalidade de Pagamento: Recorrente", "warning");
        return false
      }
    }

    return true;
  };

  const handleSubmit = () => {
    // Lógica para enviar a transação ao backend
    if (validateFilters()) {
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
  
      createTransactionService
        .mountTransaction(filter)
        .then((data) => {
          if (data != null && data.length > 0) {
            data.forEach(e => {
              e.type = type

            })
          }
          setCreationTransactions(data)
          setOpenModal(true)
        })
        .catch(() => {
          showSnackbar("Ocorreu algum erro ao montar transação.", "error");
        });
    }
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

        <h4>Modalidade de Pagamento</h4>

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

        <FormControl fullWidth margin="normal">
          <InputLabel>Forma de Pagamento</InputLabel>
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'banco' | 'cartao')}>
            <MenuItem value="banco">Banco</MenuItem>
            {type === 'despesa' && <MenuItem value="cartao">Cartão</MenuItem>}
          </Select>
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
                  {Array.from({ length: 17 }, (_, index) => (
                    <MenuItem key={index + 2} value={index + 2}>
                      {`${index + 2}x`}
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
                <MenuItem value="diario">Diário</MenuItem>
                <MenuItem value="semanal">Semanal</MenuItem>
                <MenuItem value="quinzenal">Quinzenal</MenuItem>
                <MenuItem value="mensal">Mensal</MenuItem>
                <MenuItem value="anual">Anual</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="recurrence-quantity-label">Quantidade de Recorrência</InputLabel>
              <Select
                labelId="recurrence-quantity-label"
                value={recurrenceQuantity}
                onChange={(e) => setRecurrenceQuantity(Number(e.target.value))}
                label="Quantidade de Recorrência"
              >
                {Array.from({ length: 35 }, (_, index) => (
                  <MenuItem key={index + 2} value={index + 2}>
                    {`${index + 2}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
    
        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          {type === 'despesa' ? 'Lançar Despesa' : 'Lançar Receita'}
        </Button>
      </Box>

      <TransactionsReceivablesModal
        openCategoryModal={openModal}
        setOpenCategoryModal={setOpenModal}
        transactions={creationTransactions}
        title={"Confirmar Lançamento(s)"}
      />
    </Container>
  );
};

export default RegisterTransaction;
