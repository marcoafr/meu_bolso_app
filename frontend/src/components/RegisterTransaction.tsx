import { useEffect, useState } from "react";
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
  FormLabel,
  Grid,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import CategoryDirective from "../directives/CategoryDirective";
import BankDirective from "../directives/BankDirective";
import { formatCurrency } from "../util/Util";
import CardDirective from "../directives/CardDirective";
import { useAuth } from "../authenticationContext";
import { createTransactionService } from "../api/createTransactionService";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";
import TransactionsReceivablesModal from "./TransactionsReceivablesModal";

const RegisterTransaction = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [type, setType] = useState<"despesa" | "receita">("despesa");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"unique" | "installments" | "recurring">("unique");
  const [recurrenceInterval, setRecurrenceInterval] = useState<
    "diario" | "semanal" | "quinzenal" | "mensal" | "anual"
  >("mensal");
  const [recurrenceQuantity, setRecurrenceQuantity] = useState<number>(2);
  const [category, setCategory] = useState<number>(0);
  const [alreadyPaid, setAlreadyPaid] = useState<boolean>(true);
  const [bank, setBank] = useState<number>(0);
  const [card, setCard] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"banco" | "cartao">("banco");
  const [installments, setInstallments] = useState<number>(2);
  const [installmentValue, setInstallmentValue] = useState<number>(0);

  const [creationTransactions, setCreationTransactions] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (installments > 0 && totalAmount >= 0) {
      const calculatedInstallmentValue = totalAmount / installments;
      setInstallmentValue(Math.round(calculatedInstallmentValue * 100) / 100);
    }
  }, [totalAmount, installments]);

  const handleInstallmentsChange = (event: any) => {
    setInstallments(Number(event.target.value));
  };

  const validateFilters = () => {
    if (type == null || (type !== "despesa" && type !== "receita")) {
      showSnackbar("Tipo de transação é obrigatório.", "warning");
      return false;
    }
    if (date == null) {
      showSnackbar("Data de emissão é obrigatória.", "warning");
      return false;
    }
    if (description == null || description === "") {
      showSnackbar("Descrição é obrigatória.", "warning");
      return false;
    }
    if (category == null || category <= 0) {
      showSnackbar("Categoria é obrigatória.", "warning");
      return false;
    }
    if (totalAmount == null || totalAmount <= 0) {
      showSnackbar("Valor total é obrigatório.", "warning");
      return false;
    }
    if (paymentMethod == null || (paymentMethod !== "banco" && paymentMethod !== "cartao")) {
      showSnackbar("Forma de pagamento é obrigatória.", "warning");
      return false;
    }
    if (
      paymentType == null ||
      (paymentType !== "unique" &&
        paymentType !== "installments" &&
        paymentType !== "recurring")
    ) {
      showSnackbar("Modalidade de pagamento é obrigatória.", "warning");
      return false;
    }
    if (paymentMethod === "banco" && (bank == null || bank <= 0)) {
      showSnackbar("Conta bancária é obrigatória.", "warning");
      return false;
    }
    if (paymentMethod === "cartao" && (card == null || card <= 0)) {
      showSnackbar("Cartão é obrigatório.", "warning");
      return false;
    }
    if (paymentType === "installments" && (installments == null || installments <= 0)) {
      showSnackbar("Número de parcelas é obrigatório.", "warning");
      return false;
    }
    if (paymentType === "recurring") {
      if (
        recurrenceInterval == null ||
        !["diario", "semanal", "quinzenal", "mensal", "anual"].includes(recurrenceInterval)
      ) {
        showSnackbar("Intervalo de recorrência é obrigatório.", "warning");
        return false;
      }
      if (recurrenceQuantity == null || recurrenceQuantity <= 0) {
        showSnackbar("Quantidade de recorrência é obrigatória.", "warning");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateFilters()) {
      const filter = {
        type,
        date,
        description,
        category,
        totalAmount,
        paymentType,
        paymentMethod,
        bank,
        card,
        alreadyPaid,
        installments,
        installmentValue,
        recurrenceInterval,
        recurrenceQuantity,
        userId: user?.id,
      };

      createTransactionService
        .mountTransaction(filter)
        .then((data) => {
          if (data != null && data.length > 0) {
            data.forEach((e) => {
              e.type = type;
            });
          }
          setCreationTransactions(data);
          setOpenModal(true);
        })
        .catch(() => {
          showSnackbar("Ocorreu um erro ao montar a transação.", "error");
        });
    }
  };

  const sectionCardStyle = {
    p: { xs: 2.5, md: 3 },
    borderRadius: "24px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.82rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1,
            }}
          >
            Transações
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
              mb: 1.2,
            }}
          >
            Registrar transação
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.98rem", md: "1.02rem" },
              lineHeight: 1.7,
              maxWidth: "720px",
            }}
          >
            Preencha os dados abaixo para lançar uma nova despesa ou receita de forma
            organizada e rápida.
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Paper elevation={0} sx={sectionCardStyle}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", mb: 2.5 }}>
              Dados da transação
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={type}
                    label="Tipo"
                    onChange={(e) => setType(e.target.value as "despesa" | "receita")}
                  >
                    <MenuItem value="despesa">Despesa</MenuItem>
                    <MenuItem value="receita">Receita</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Data de emissão"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  placeholder="Ex: Supermercado, salário, aluguel..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <CategoryDirective
                    multiple={false}
                    value={category}
                    onChange={(newCategory) => {
                      setCategory(Number(newCategory));
                    }}
                    includeTypeOnName={true}
                    showOnlyReceiptOrExpense={type === "despesa" ? "expense" : "receipt"}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Valor total (R$)"
                  fullWidth
                  type="number"
                  value={totalAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numeric = parseFloat(value);
                    setTotalAmount(isNaN(numeric) ? 0 : Number(numeric.toFixed(2)));
                  }}
                  inputProps={{ step: "0.01", min: 0 }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={sectionCardStyle}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", mb: 2 }}>
              Pagamento
            </Typography>

            <Stack spacing={3}>
              <Box>
                <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#334155" }}>
                  Modalidade de pagamento
                </FormLabel>
                <RadioGroup
                  row
                  value={paymentType}
                  onChange={(e) =>
                    setPaymentType(e.target.value as "unique" | "installments" | "recurring")
                  }
                  sx={{ gap: { xs: 1, md: 3 } }}
                >
                  <FormControlLabel value="unique" control={<Radio />} label="Único" />
                  <FormControlLabel value="installments" control={<Radio />} label="Parcelado" />
                  <FormControlLabel value="recurring" control={<Radio />} label="Recorrente" />
                </RadioGroup>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Forma de pagamento</InputLabel>
                    <Select
                      value={paymentMethod}
                      label="Forma de pagamento"
                      onChange={(e) => setPaymentMethod(e.target.value as "banco" | "cartao")}
                    >
                      <MenuItem value="banco">Banco</MenuItem>
                      {type === "despesa" && <MenuItem value="cartao">Cartão</MenuItem>}
                    </Select>
                  </FormControl>
                </Grid>

                {paymentMethod === "banco" && (
                  <>
                    {paymentType === "unique" && (
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <FormLabel sx={{ mb: 1, fontWeight: 600, color: "#334155" }}>
                            Já foi pago?
                          </FormLabel>
                          <RadioGroup
                            row
                            value={alreadyPaid ? "sim" : "nao"}
                            onChange={(e) => setAlreadyPaid(e.target.value === "sim")}
                          >
                            <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                            <FormControlLabel value="nao" control={<Radio />} label="Não" />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <BankDirective
                          value={bank}
                          onChange={(newBankValue) => {
                            setBank(Number(newBankValue));
                          }}
                          multiple={false}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}

                {paymentMethod === "cartao" && (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <CardDirective
                        value={card}
                        onChange={(newCard) => {
                          setCard(Number(newCard));
                        }}
                        multiple={false}
                      />
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </Stack>
          </Paper>

          {paymentType === "installments" && (
            <Paper elevation={0} sx={sectionCardStyle}>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", mb: 2.5 }}>
                Parcelamento
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="installments-label">Número de parcelas</InputLabel>
                    <Select
                      labelId="installments-label"
                      value={installments}
                      label="Número de parcelas"
                      onChange={handleInstallmentsChange}
                    >
                      {Array.from({ length: 17 }, (_, index) => (
                        <MenuItem key={index + 2} value={index + 2}>
                          {`${index + 2}x`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Valor da parcela"
                    value={formatCurrency(installmentValue)}
                    fullWidth
                    disabled
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {paymentType === "recurring" && (
            <Paper elevation={0} sx={sectionCardStyle}>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", mb: 2.5 }}>
                Recorrência
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Intervalo de recorrência</InputLabel>
                    <Select
                      value={recurrenceInterval}
                      label="Intervalo de recorrência"
                      onChange={(e) =>
                        setRecurrenceInterval(
                          e.target.value as
                            | "diario"
                            | "semanal"
                            | "quinzenal"
                            | "mensal"
                            | "anual"
                        )
                      }
                    >
                      <MenuItem value="diario">Diário</MenuItem>
                      <MenuItem value="semanal">Semanal</MenuItem>
                      <MenuItem value="quinzenal">Quinzenal</MenuItem>
                      <MenuItem value="mensal">Mensal</MenuItem>
                      <MenuItem value="anual">Anual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="recurrence-quantity-label">
                      Quantidade de recorrência
                    </InputLabel>
                    <Select
                      labelId="recurrence-quantity-label"
                      value={recurrenceQuantity}
                      label="Quantidade de recorrência"
                      onChange={(e) => setRecurrenceQuantity(Number(e.target.value))}
                    >
                      {Array.from({ length: 35 }, (_, index) => (
                        <MenuItem key={index + 2} value={index + 2}>
                          {`${index + 2}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: "24px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              backgroundColor: "#ffffff",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: "16px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "none",
              }}
            >
              {type === "despesa" ? "Lançar despesa" : "Lançar receita"}
            </Button>
          </Paper>
        </Stack>

        <TransactionsReceivablesModal
          openCategoryModal={openModal}
          setOpenCategoryModal={setOpenModal}
          transactions={creationTransactions}
          title={"Confirmar lançamento(s)"}
        />
      </Container>
    </Box>
  );
};

export default RegisterTransaction;