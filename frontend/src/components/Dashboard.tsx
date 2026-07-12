import { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Container,
  Box,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Button,
  TextField,
  Modal,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { dashboardService } from "../api/dashboardService";
import { formatCurrency, formatArrayDate } from "../util/Util";
import { useAuth } from "../authenticationContext";
import { creditCardService } from "../api/creditCardService";
import { receivableService } from "../api/receivableService";
import CardEntityDirective from "../directives/CardEntityDirective";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import BankDirective from "../directives/BankDirective";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";
import NivoBarChart from "./NivoBarChart";
import NivoPieChart from "./NivoPieChart";
import { ShowChart } from "@mui/icons-material";
import NivoLineChart from "./NivoLineChart";

interface BankAccountBalance {
  id: number;
  name: string;
  currentBalance: number;
  color: string;
}

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [bankAccounts, setBankAccounts] = useState<BankAccountBalance[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const currentDate = new Date();

  const [selectedMonthYear, setSelectedMonthYear] = useState<{
    month: string;
    year: string;
  }>({
    month: (currentDate.getMonth() + 1).toString().padStart(2, "0"),
    year: currentDate.getFullYear().toString(),
  });

  const [expenseFilter, setExpenseFilter] = useState<{
    month: string;
    year: string;
  }>({
    month: (currentDate.getMonth() + 1).toString().padStart(2, "0"),
    year: currentDate.getFullYear().toString(),
  });

  const [summarizedInfo, setSummarizedInfo] = useState<any[]>([]);
  const [receivablesByCategory, setReceivablesByCategory] = useState<any[]>([]);

  const [transferOpenModal, setTransferOpenModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [fromBank, setFromBank] = useState<number>(0);
  const [toBank, setToBank] = useState<number>(0);

  const [heritageEvolutionOpenModal, setHeritageEvolutionOpenModal] = useState(false);
  const [heritageEvolutionFilter, setHeritageEvolutionFilter] = useState(3);
  const [heritageEvolutionResults, setHeritageEvolutionResults] = useState<any[]>([]);

  const sectionCardStyle = {
    p: { xs: 2.5, md: 3 },
    borderRadius: "24px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
    overflow: "visible",
  };

  const dashboardItemCardSx = {
    p: 2.2,
    borderRadius: "20px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
    width: "100%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start",
    overflow: "hidden",
  };

  const softInfoCardSx = {
    p: 2.2,
    borderRadius: "20px",
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(15, 23, 42, 0.06)",
    width: "100%",
    minWidth: 0,
    minHeight: 118,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    overflow: "hidden",
  };

  const handleTransferOpenModal = () => setTransferOpenModal(true);
  const handleTransferCloseModal = () => setTransferOpenModal(false);

  const handleConfirmTransferAmount = () => {
    const filter = {
      fromBankAccount: fromBank,
      toBankAccount: toBank,
      amount: transferAmount,
      userId: user?.id,
    };

    dashboardService
      .bankTransfer(filter)
      .then(() => {
        setToBank(0);
        setFromBank(0);
        setTransferAmount(0);
        setTransferOpenModal(false);
        showSnackbar("Transferência computada!", "success");
        fetchCurrentBalance();
      })
      .catch(() => {
        showSnackbar("Não foi possível computar transferência!", "error");
      });
  };

  const handleHeritageEvolutionOpenModal = () => {
    setHeritageEvolutionOpenModal(true);
    fetchHeritageEvolution(heritageEvolutionFilter);
  };

  const handleHeritageEvolutionCloseModal = () => setHeritageEvolutionOpenModal(false);

  const processDataForChart = (heritageEvolutionResults: any[]) => {
    const data: any[] = [];

    heritageEvolutionResults.forEach((result) => {
      const date = result.periodDate.join("-");

      result.bankAccountsBalances.forEach((account: any) => {
        let accountData = data.find((d) => d.id === account.accountName);

        if (!accountData) {
          accountData = {
            id: account.accountName,
            color: account.accountColor,
            data: [],
          };
          data.push(accountData);
        }

        accountData.data.push({
          x: date,
          y: account.balanceAtPeriod,
        });
      });
    });

    return data;
  };

  const fetchHeritageEvolution = async (monthsAmount: number) => {
    try {
      const data = await dashboardService.heritageEvolution({
        userId: user?.id,
        monthsAmount,
      });

      data.sort((a: any, b: any) => {
        const dateA = a.periodDate;
        const dateB = b.periodDate;
        return dateA[0] - dateB[0] || dateA[1] - dateB[1] || dateA[2] - dateB[2];
      });

      const chartData = processDataForChart(data);
      setHeritageEvolutionResults(chartData);
    } catch (error) {
      console.error("Erro ao buscar evolução patrimonial:", error);
    }
  };

  const handleHeritageEvolutionFilterChange = (event: any) => {
    const newFilterValue = Number(event.target.value);
    setHeritageEvolutionFilter(newFilterValue);
    fetchHeritageEvolution(newFilterValue);
  };

  const fetchCurrentBalance = async () => {
    try {
      const data = await dashboardService.currentBalance(user?.id);
      setBankAccounts(data);
    } catch (error) {
      console.error("Erro ao buscar saldos atuais:", error);
    }
  };

  useEffect(() => {
    fetchCurrentBalance();
  }, [user]);

  useEffect(() => {
    if (!selectedCard || selectedCard.id === 0) {
      setSummarizedInfo([]);
      return;
    }

    if (selectedCard?.id > 0 && selectedMonthYear.month && selectedMonthYear.year) {
      creditCardService
        .summarizedInfo({
          creditCardId: selectedCard.id,
          month: selectedMonthYear.month,
          year: selectedMonthYear.year,
          userId: user?.id,
        })
        .then((data) => {
          if (data.length > 0) {
            data.forEach((r: any) => {
              r.competenceDate = r.competenceDate ? formatArrayDate(r.competenceDate) : "";
              r.metadata = r.metadata ? JSON.parse(r.metadata) : {};
            });
          }
          setSummarizedInfo(data);
        })
        .catch((error) => {
          console.error("Erro ao buscar informações da fatura:", error);
        });
    }
  }, [selectedCard, selectedMonthYear, user]);

  useEffect(() => {
    if (!user || !expenseFilter.month || !expenseFilter.year) {
      return;
    }

    receivableService
      .receivablesByMonth({
        userId: user.id,
        month: expenseFilter.month,
        year: expenseFilter.year,
      })
      .then((data) => {
        setReceivablesByCategory(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar movimentações por categoria:", error);
      });
  }, [expenseFilter, user]);

  const handleMonthYearChange = (field: "month" | "year", value: string) => {
    setSelectedMonthYear((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseFilterChange = (field: "month" | "year", value: string) => {
    setExpenseFilter((prev) => ({ ...prev, [field]: value }));
  };

  const pieChartData = summarizedInfo
    .filter((item) => item.status === 0 || item.status === 1)
    .reduce<{ [key: string]: number }>((acc, item) => {
      const category = item.transactionDTO.categoryDTO.name;
      const amount = Number(item.amount) || 0;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});

  const formattedPieChartData = Object.entries(pieChartData).map(([key, value]) => ({
    id: key,
    label: key,
    value,
  }));

  const totalBalance = useMemo(
    () => bankAccounts.reduce((acc, item) => acc + (item.currentBalance || 0), 0),
    [bankAccounts]
  );

  const totalInvoice = useMemo(
    () => summarizedInfo.reduce((acc, item) => acc + (item.amount || 0), 0),
    [summarizedInfo]
  );

  const paidInvoice = useMemo(
    () =>
      summarizedInfo
        .filter((item) => item.status === 1)
        .reduce((acc, item) => acc + (item.amount || 0), 0),
    [summarizedInfo]
  );

  const pendingInvoice = useMemo(
    () =>
      summarizedInfo
        .filter((item) => item.status === 0)
        .reduce((acc, item) => acc + (item.amount || 0), 0),
    [summarizedInfo]
  );

  const getPaymentMonth = () => {
    const currentMonth = Number(selectedMonthYear.month);
    const payingDay = Number(selectedCard?.payingDay || 0);
    const closingDay = Number(selectedCard?.closingDay || 0);

    if (payingDay - closingDay < 0) {
      const nextMonth = currentMonth + 1;
      return String(nextMonth > 12 ? 1 : nextMonth).padStart(2, "0");
    }

    return String(currentMonth).padStart(2, "0");
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return "Pendente";
      case 1:
        return "Pago";
      case 3:
        return "Cancelado";
      case 4:
        return "Deletado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusChipStyle = (status: number) => {
    switch (status) {
      case 0:
        return { color: "#b45309", backgroundColor: "#fef3c7" };
      case 1:
        return { color: "#166534", backgroundColor: "#dcfce7" };
      case 3:
        return { color: "#b91c1c", backgroundColor: "#fee2e2" };
      case 4:
        return { color: "#475569", backgroundColor: "#e2e8f0" };
      default:
        return { color: "#475569", backgroundColor: "#e2e8f0" };
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="xl">
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
            Visão geral
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
            Dashboard
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.98rem", md: "1.02rem" },
              lineHeight: 1.7,
              maxWidth: "780px",
            }}
          >
            Acompanhe saldos, faturas e movimentações por categoria em uma visão
            mais clara, objetiva e pronta para análise.
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Paper elevation={0} sx={sectionCardStyle}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <Box>
                  <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                    Saldos atuais
                  </Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                    Acompanhe rapidamente o saldo consolidado das suas contas.
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    startIcon={<SyncAltIcon />}
                    onClick={handleTransferOpenModal}
                    sx={{
                      borderRadius: "14px",
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "none",
                    }}
                  >
                    Transferir
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ShowChart />}
                    onClick={handleHeritageEvolutionOpenModal}
                    sx={{
                      borderRadius: "14px",
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Evolução patrimonial
                  </Button>
                </Stack>
              </Stack>

              <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={12} md={4} sx={{ display: "flex", minWidth: 0 }}>
                  <Paper elevation={0} sx={softInfoCardSx}>
                    <Typography sx={{ color: "#64748b", fontSize: "0.92rem", mb: 0.6 }}>
                      Patrimônio em contas
                    </Typography>
                    <Typography
                      sx={{
                        color: "#0f172a",
                        fontWeight: 800,
                        fontSize: "1.6rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {formatCurrency(totalBalance)}
                    </Typography>
                  </Paper>
                </Grid>

                {bankAccounts.map((account) => (
                  <Grid item xs={12} sm={6} md={4} key={account.id} sx={{ display: "flex", minWidth: 0 }}>
                    <Paper elevation={0} sx={dashboardItemCardSx}>
                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: "999px",
                              backgroundColor: account.color || "#cbd5e1",
                              boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.10)",
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#0f172a",
                              minWidth: 0,
                              wordBreak: "break-word",
                            }}
                          >
                            {account.name}
                          </Typography>
                        </Stack>

                        <Typography
                          sx={{
                            color: "#0f172a",
                            fontWeight: 800,
                            fontSize: "1.25rem",
                            wordBreak: "break-word",
                          }}
                        >
                          {formatCurrency(account.currentBalance)}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {bankAccounts.length === 0 && (
                <Typography sx={{ color: "#64748b" }}>
                  Nenhuma conta encontrada.
                </Typography>
              )}
            </Stack>
          </Paper>

          <Paper elevation={0} sx={sectionCardStyle}>
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                  Cartões de crédito
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                  Consulte a composição da fatura e a distribuição por categoria.
                </Typography>
              </Box>

              <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
                  <FormControl fullWidth>
                    <CardEntityDirective
                      value={selectedCard!}
                      onChange={(newCard) => setSelectedCard(newCard)}
                      multiple={false}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={6} md={3} sx={{ minWidth: 0 }}>
                  <FormControl fullWidth>
                    <InputLabel id="month-label">Mês</InputLabel>
                    <Select
                      labelId="month-label"
                      value={selectedMonthYear.month}
                      label="Mês"
                      onChange={(e) => handleMonthYearChange("month", e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, "0");
                        return (
                          <MenuItem key={month} value={month}>
                            {month}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} md={3} sx={{ minWidth: 0 }}>
                  <FormControl fullWidth>
                    <InputLabel id="year-label">Ano</InputLabel>
                    <Select
                      labelId="year-label"
                      value={selectedMonthYear.year}
                      label="Ano"
                      onChange={(e) => handleMonthYearChange("year", e.target.value)}
                    >
                      {Array.from({ length: 80 }, (_, i) => {
                        const year = (2021 + i).toString();
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {selectedCard && summarizedInfo.length > 0 && (
                <Grid container spacing={2} alignItems="stretch">
                  <Grid item xs={12} md={3} sx={{ display: "flex", minWidth: 0 }}>
                    <Paper elevation={0} sx={softInfoCardSx}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.92rem", mb: 0.6 }}>
                        Total da fatura
                      </Typography>
                      <Typography
                        sx={{
                          color: "#0f172a",
                          fontWeight: 800,
                          fontSize: "1.45rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {formatCurrency(totalInvoice)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ display: "flex", minWidth: 0 }}>
                    <Paper elevation={0} sx={softInfoCardSx}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.92rem", mb: 0.6 }}>
                        Total pago
                      </Typography>
                      <Typography
                        sx={{
                          color: "#166534",
                          fontWeight: 800,
                          fontSize: "1.45rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {formatCurrency(paidInvoice)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ display: "flex", minWidth: 0 }}>
                    <Paper elevation={0} sx={softInfoCardSx}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.92rem", mb: 0.6 }}>
                        Total pendente
                      </Typography>
                      <Typography
                        sx={{
                          color: "#b45309",
                          fontWeight: 800,
                          fontSize: "1.45rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {formatCurrency(pendingInvoice)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ display: "flex", minWidth: 0 }}>
                    <Paper elevation={0} sx={softInfoCardSx}>
                      <Typography sx={{ color: "#64748b", fontSize: "0.92rem", mb: 0.6 }}>
                        Previsão de pagamento
                      </Typography>
                      <Typography
                        sx={{
                          color: "#0f172a",
                          fontWeight: 700,
                          wordBreak: "break-word",
                        }}
                      >
                        Dia {String(selectedCard?.payingDay).padStart(2, "0")} / {getPaymentMonth()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {formattedPieChartData.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    height: { xs: 280, md: 380 },
                    minHeight: 280,
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "20px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid rgba(15, 23, 42, 0.06)",
                    p: 1,
                  }}
                >
                  <NivoPieChart data={formattedPieChartData} />
                </Box>
              )}

              {summarizedInfo.length > 0 ? (
                <Grid container spacing={2} alignItems="stretch">
                  {summarizedInfo.map((r, index) => {
                    const statusStyle = getStatusChipStyle(r.status);

                    return (
                      <Grid item xs={12} md={6} xl={4} key={index} sx={{ display: "flex", minWidth: 0 }}>
                        <Paper elevation={0} sx={dashboardItemCardSx}>
                          <Stack spacing={1.5}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              gap={1.5}
                              flexWrap="wrap"
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  fontSize: "1rem",
                                  minWidth: 0,
                                  wordBreak: "break-word",
                                  flex: 1,
                                }}
                              >
                                {r.transactionDTO.description}
                              </Typography>

                              <Chip
                                label={getStatusLabel(r.status)}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  color: statusStyle.color,
                                  backgroundColor: statusStyle.backgroundColor,
                                  flexShrink: 0,
                                  maxWidth: "100%",
                                }}
                              />
                            </Box>

                            <Typography sx={{ color: "#64748b", fontSize: "0.93rem", wordBreak: "break-word" }}>
                              Categoria: {r.transactionDTO.categoryDTO.name}
                            </Typography>

                            <Typography sx={{ color: "#64748b", fontSize: "0.93rem", wordBreak: "break-word" }}>
                              Data: {r.competenceDate}
                            </Typography>

                            <Typography
                              sx={{
                                color: "#0f172a",
                                fontWeight: 800,
                                fontSize: "1.15rem",
                                wordBreak: "break-word",
                              }}
                            >
                              {formatCurrency(r.amount)}
                            </Typography>

                            {r.metadata?.installment && r.metadata?.total_installments && (
                              <Typography sx={{ color: "#64748b", fontSize: "0.92rem", wordBreak: "break-word" }}>
                                Parcela {r.metadata.installment} / {r.metadata.total_installments}
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography sx={{ color: "#64748b" }}>
                  Nenhuma transação encontrada para o filtro selecionado.
                </Typography>
              )}
            </Stack>
          </Paper>

          <Paper elevation={0} sx={sectionCardStyle}>
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                  Movimentações por categoria
                </Typography>
                <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                  Compare o realizado com o orçamento por categoria.
                </Typography>
              </Box>

              <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={6} md={3} sx={{ minWidth: 0 }}>
                  <FormControl fullWidth>
                    <InputLabel id="expense-month-label">Mês</InputLabel>
                    <Select
                      labelId="expense-month-label"
                      value={expenseFilter.month}
                      label="Mês"
                      onChange={(e) => handleExpenseFilterChange("month", e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, "0");
                        return (
                          <MenuItem key={month} value={month}>
                            {month}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6} md={3} sx={{ minWidth: 0 }}>
                  <FormControl fullWidth>
                    <InputLabel id="expense-year-label">Ano</InputLabel>
                    <Select
                      labelId="expense-year-label"
                      value={expenseFilter.year}
                      label="Ano"
                      onChange={(e) => handleExpenseFilterChange("year", e.target.value)}
                    >
                      {Array.from({ length: 80 }, (_, i) => {
                        const year = (2021 + i).toString();
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {receivablesByCategory.length > 0 && (
                <Box
                  sx={{
                    mt: 1,
                    height: { xs: 320, md: 400 },
                    minHeight: 320,
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "20px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid rgba(15, 23, 42, 0.06)",
                    p: 1,
                  }}
                >
                  <NivoBarChart data={receivablesByCategory} />
                </Box>
              )}

              {receivablesByCategory.length > 0 ? (
                <Grid container spacing={2} alignItems="stretch">
                  {receivablesByCategory.map((r, index) => {
                    const difference =
                      r.categoryType === "RECEIPT"
                        ? r.totalAmount - r.totalExpected
                        : r.totalExpected - r.totalAmount;

                    const percentage =
                      r.totalExpected === 0
                        ? "n/a"
                        : `${((r.totalAmount / r.totalExpected) * 100).toFixed(2)}%`;

                    const positive = difference >= 0;

                    return (
                      <Grid item xs={12} md={6} xl={4} key={index} sx={{ display: "flex", minWidth: 0 }}>
                        <Paper elevation={0} sx={dashboardItemCardSx}>
                          <Stack spacing={1.4}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              gap={1.5}
                              flexWrap="wrap"
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  fontSize: "1rem",
                                  minWidth: 0,
                                  wordBreak: "break-word",
                                  flex: 1,
                                }}
                              >
                                {r.categoryName}
                              </Typography>

                              <Chip
                                label={r.categoryType === "RECEIPT" ? "Receita" : "Despesa"}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  color:
                                    r.categoryType === "RECEIPT" ? "#166534" : "#b91c1c",
                                  backgroundColor:
                                    r.categoryType === "RECEIPT" ? "#dcfce7" : "#fee2e2",
                                  flexShrink: 0,
                                  maxWidth: "100%",
                                }}
                              />
                            </Box>

                            <Typography sx={{ color: "#64748b", fontSize: "0.92rem", wordBreak: "break-word" }}>
                              Total pago: {formatCurrency(r.totalPaidAmount)}
                            </Typography>

                            <Typography sx={{ color: "#64748b", fontSize: "0.92rem", wordBreak: "break-word" }}>
                              Total previsto: {formatCurrency(r.totalAmount - r.totalPaidAmount)}
                            </Typography>

                            <Typography sx={{ color: "#64748b", fontSize: "0.92rem", wordBreak: "break-word" }}>
                              Total movimentado: {formatCurrency(r.totalAmount)}
                            </Typography>

                            <Typography sx={{ color: "#64748b", fontSize: "0.92rem", wordBreak: "break-word" }}>
                              Orçamento: {formatCurrency(r.totalExpected)}
                            </Typography>

                            <Divider />

                            <Typography
                              sx={{
                                color: positive ? "#166534" : "#b91c1c",
                                fontWeight: 800,
                                fontSize: "1rem",
                                wordBreak: "break-word",
                              }}
                            >
                              Diferença: {formatCurrency(difference)} ({percentage})
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Typography sx={{ color: "#64748b" }}>
                  Nenhum recebível encontrado para o período selecionado.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Stack>

        <Modal open={transferOpenModal} onClose={handleTransferCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "92%", sm: 460 },
              bgcolor: "background.paper",
              p: 3,
              borderRadius: "24px",
              boxShadow: 24,
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, mb: 2.5 }}>
              Transferência entre contas
            </Typography>

            <Stack spacing={2}>
              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1, color: "#475569", fontWeight: 600 }}>
                  Origem
                </Typography>
                <BankDirective
                  value={fromBank}
                  onChange={(newBankValue) => {
                    setFromBank(Number(newBankValue));
                    setToBank(0);
                  }}
                  multiple={false}
                />
              </FormControl>

              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1, color: "#475569", fontWeight: 600 }}>
                  Destino
                </Typography>
                <BankDirective
                  value={toBank}
                  onChange={(newBankValue) => {
                    if (Number(newBankValue) === fromBank) {
                      showSnackbar("Banco destino não pode ser igual ao banco origem!", "warning");
                      return;
                    }
                    setToBank(Number(newBankValue));
                  }}
                  multiple={false}
                />
              </FormControl>

              <TextField
                label="Valor (R$)"
                fullWidth
                type="number"
                value={transferAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = parseFloat(value);
                  setTransferAmount(isNaN(parsed) ? 0 : Number(parsed.toFixed(2)));
                }}
                inputProps={{ step: "0.01", min: 0 }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                <Button onClick={handleTransferCloseModal} variant="outlined">
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleConfirmTransferAmount}>
                  Confirmar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        <Modal open={heritageEvolutionOpenModal} onClose={handleHeritageEvolutionCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "94vw" : "min(1200px, 92vw)",
              maxHeight: "88vh",
              bgcolor: "background.paper",
              p: 3,
              borderRadius: "24px",
              boxShadow: 24,
              overflow: "auto",
            }}
          >
            <Stack spacing={2.5}>
              <Typography sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
                Evolução patrimonial
              </Typography>

              <FormControl fullWidth>
                <InputLabel id="fetch-heritage-evolution">Selecione o período</InputLabel>
                <Select
                  labelId="fetch-heritage-evolution"
                  value={heritageEvolutionFilter}
                  label="Selecione o período"
                  onChange={handleHeritageEvolutionFilterChange}
                >
                  <MenuItem value={3}>Últimos 3 meses</MenuItem>
                  <MenuItem value={6}>Últimos 6 meses</MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  width: "100%",
                  height: isMobile ? 500 : 420,
                  minHeight: 320,
                  overflow: "hidden",
                  borderRadius: "18px",
                }}
              >
                {heritageEvolutionResults.length > 0 ? (
                  <NivoLineChart data={heritageEvolutionResults} />
                ) : (
                  <Typography sx={{ color: "#64748b" }}>
                    Nenhum dado encontrado para o período selecionado.
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleHeritageEvolutionCloseModal} variant="outlined">
                  Fechar
                </Button>
              </Box>
            </Stack>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default Dashboard;