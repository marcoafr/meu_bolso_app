import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Button,
  TextField,
  Modal,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { dashboardService } from "../api/dashboardService";
import { formatCurrency, formatArrayDate } from "../util/Util";
import { useAuth } from "../authenticationContext";
import { creditCardService } from "../api/creditCardService";
import { receivableService } from "../api/receivableService";
import CardEntityDirective from "../directives/CardEntityDirective";
import SyncAltIcon from '@mui/icons-material/SyncAlt';
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detecta se é mobile
  const [bankAccounts, setBankAccounts] = useState<BankAccountBalance[]>([]);
  const { showSnackbar } = useSnackbar(); // Usando o hook do Snackbar
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const currentDate = new Date();
  const [selectedMonthYear, setSelectedMonthYear] = useState<{ month: string; year: string }>({
    month: (currentDate.getMonth() + 1).toString().padStart(2, "0"),
    year: currentDate.getFullYear().toString(),
  });
  const [expenseFilter, setExpenseFilter] = useState<{ month: string; year: string }>({
    month: (currentDate.getMonth() + 1).toString().padStart(2, "0"),
    year: currentDate.getFullYear().toString(),
  });
  const [summarizedInfo, setSummarizedInfo] = useState<any[]>([]); // Estado para armazenar os dados da fatura
  const [receivablesByCategory, setReceivablesByCategory] = useState<any[]>([]);

  const [transferOpenModal, setTransferOpenModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [fromBank, setFromBank] = useState<number>(0);
  const [toBank, setToBank] = useState<number>(0);

  const [heritageEvolutionOpenModal, setHeritageEvolutionOpenModal] = useState(false);
  const [heritageEvolutionFilter, setHeritageEvolutionFilter] = useState(3);
  const [heritageEvolutionResults, setHeritageEvolutionResults] = useState<any[]>([]);

  const handleTransferOpenModal = () => setTransferOpenModal(true);
  const handleTransferCloseModal = () => setTransferOpenModal(false);
  const handleConfirmTransferAmount = () => {
    const filter = {
      fromBankAccount: fromBank,
      toBankAccount: toBank,
      amount: transferAmount,
      userId: user?.id
    }

    dashboardService
      .bankTransfer(filter)
      .then(() => {
        setToBank(0);
        setFromBank(0);
        setTransferAmount(0);
        setTransferOpenModal(false); // Armazena os dados recebidos
        showSnackbar("Transferência computada!", "success");
        fetchCurrentBalance();
      }).catch((error) => {
        showSnackbar("Não foi possível computar transferência!", "error");
      });
  }

  const handleHeritageEvolutionOpenModal = () => {
    setHeritageEvolutionOpenModal(true)
    fetchHeritageEvolution(heritageEvolutionFilter);
  };
  const handleHeritageEvolutionCloseModal = () => setHeritageEvolutionOpenModal(false);
  const fetchHeritageEvolution = async (monthsAmount: number) => {
    try {
      const data = await dashboardService.heritageEvolution({
        userId: user?.id,
        monthsAmount: monthsAmount, // Passa 3 ou 6
      });
      const chartData = processDataForChart(data);
      setHeritageEvolutionResults(chartData);
      // Tratar o retorno aqui, se necessário
    } catch (error) {
      console.error("Erro ao buscar a evolução patrimonial:", error);
    }
  };


  const handleHeritageEvolutionFilterChange = (event) => {
    const newFilterValue = Number(event.target.value); // Captura o valor 3 ou 6
    setHeritageEvolutionFilter(newFilterValue);
    fetchHeritageEvolution(newFilterValue); // Chama o método passando o valor 3 ou 6
  };

  const fetchCurrentBalance = async () => {
    try {
      const data = await dashboardService.currentBalance(user?.id);
      setBankAccounts(data);
    } catch (error) {
      console.error("Erro ao buscar os saldos atuais:", error);
    }
  };

  // Fetch current balance
  useEffect(() => {
    fetchCurrentBalance();
  }, [user]);

  // Effect to monitor changes in filters
  useEffect(() => {
    if (!selectedCard || selectedCard.id == 0) {
      setSummarizedInfo([]);
      return; // Não faz a consulta se selectedCard for null ou 0
    }
  
    if (selectedCard && selectedCard.id > 0 && selectedMonthYear.month && selectedMonthYear.year) {
      creditCardService.summarizedInfo({
          creditCardId: selectedCard!.id,
          month: selectedMonthYear.month,
          year: selectedMonthYear.year,
          userId: user?.id,
        }).then((data) => {
          if (data.length > 0) {
            data.forEach((r: any) => {
              r.competenceDate = r.competenceDate ? formatArrayDate(r.competenceDate) : "";
              r.metadata = r.metadata ? JSON.parse(r.metadata) : {};
            });
          }
          setSummarizedInfo(data); // Armazena os dados recebidos
        }).catch((error) => {
          console.error("Erro ao buscar informações da fatura:", error);
        });
    }
  }, [selectedCard, selectedMonthYear, user]);

  // Effect to monitor changes in expense filters
  useEffect(() => {
    if (!user || !expenseFilter.month || !expenseFilter.year) {
      return; // Se algum filtro necessário estiver ausente, não faz a consulta
    }

    receivableService.receivablesByMonth({
      userId: user.id,
      month: expenseFilter.month,
      year: expenseFilter.year,
    }).then((data) => {  
      setReceivablesByCategory(data); // Atualiza o estado
    }).catch((error) => {
      console.error("Erro ao buscar informações da movimentações por categoria:", error);
    });
  }, [expenseFilter, user]);

  const handleMonthYearChange = (field: "month" | "year", value: string) => {
    setSelectedMonthYear((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseFilterChange = (field: "month" | "year", value: string) => {
    setExpenseFilter((prev) => ({ ...prev, [field]: value }));
  };

  const pieChartData = summarizedInfo
  .filter((item) => item.status === 0 || item.status === 1) // Apenas Pendente ou Pago
  .reduce<{ [key: string]: number }>((acc, item) => {
    const category = item.transactionDTO.categoryDTO.name;
    const amount = Number(item.amount) || 0; // Garante que é número
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const formattedPieChartData = Object.entries(pieChartData).map(([key, value]) => ({
    id: key,
    label: key,
    value: value,
  }));

  // Função para processar os dados recebidos para o gráfico
  const processDataForChart = (heritageEvolutionResults: any[]) => {
    const data = [];

    // Iterar sobre cada item de período e agrupar os saldos por conta
    heritageEvolutionResults.forEach((result) => {
      const date = result.periodDate.join('-'); // Transformar a data em uma string no formato YYYY-MM-DD
      
      result.bankAccountsBalances.forEach((account) => {
        // Verificar se já existe uma linha para a conta
        let accountData = data.find(d => d.id === account.accountName);

        if (!accountData) {
          // Se não existir, cria a estrutura inicial para a conta
          accountData = {
            id: account.accountName,
            color: account.accountColor,
            data: []
          };
          data.push(accountData);
        }

        // Adicionar o saldo da conta para o período atual
        accountData.data.push({
          x: date, // Data como eixo X
          y: account.balanceAtPeriod // Saldo da conta no eixo Y
        });
      });
    });

    return data;
  };

  return (
    <Container>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Dashboard
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Card 1: Current Balances */}
        <Card
          sx={{
            backgroundColor: "#f5f5f5",
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" gutterBottom>
                Saldo Atual
              </Typography>
              <Button
                variant="contained"
                startIcon={<SyncAltIcon />}
                onClick={handleTransferOpenModal}
                sx={{ marginLeft: 2 }}
                size="small"
              >
                Transferir
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShowChart />}
                onClick={handleHeritageEvolutionOpenModal}
                sx={{ marginLeft: 2 }}
                size="small"
              >
                Evolução Patrimonial
              </Button>
            </Box>
            {bankAccounts.length > 0 ? (
              bankAccounts.map((account) => (
                <Typography key={account.id}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      backgroundColor: account.color,
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  ></span>
                  {account.name}: {formatCurrency(account.currentBalance)}
                </Typography>
              ))
            ) : (
              <Typography>Nenhuma conta encontrada.</Typography>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Filters */}
        <Card sx={{ backgroundColor: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Cartões de Crédito
            </Typography>

            <FormControl fullWidth margin="normal">
              <CardEntityDirective
                value={selectedCard!}
                onChange={(newCard) => setSelectedCard(newCard)}
                multiple={false}
              />
            </FormControl>

            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel id="month-label">Mês</InputLabel>
                <Select
                  labelId="month-label"
                  value={selectedMonthYear.month}
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

              <FormControl fullWidth>
                <InputLabel id="year-label">Ano</InputLabel>
                <Select
                  labelId="year-label"
                  value={selectedMonthYear.year}
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
            </Box>

            {/* Gráfico de Barras Horizontais */}
            {formattedPieChartData.length > 0 && (
              <Box sx={{ marginTop: 2, height: "400px" }}>
                <NivoPieChart data={formattedPieChartData} />
              </Box>
            )}

            {/* Tabela transformada em uma lista para mobile */}
            {summarizedInfo.length > 0 ? (
              <>
                {/* Linha com o valor total da fatura e dia de pagamento */}
                <Box sx={{ marginY: 2, padding: 2, backgroundColor: "#e0e0e0", borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Valor Total da Fatura: {formatCurrency(summarizedInfo.reduce((acc, r) => acc + r.amount, 0))}
                  </Typography>
                  <Typography variant="body1">
                    Dia de Pagamento: {String(selectedCard?.payingDay).padStart(2, '0')} /{' '}
                    {String(
                      selectedCard?.payingDay - selectedCard?.closingDay < 0
                        ? + selectedMonthYear.month + 1
                        : + selectedMonthYear.month
                    ).padStart(2, '0')}
                  </Typography>
                </Box>

                <Box sx={{ marginTop: 2 }}>
                  {summarizedInfo.map((r, index) => (
                    <Card key={index} sx={{ backgroundColor: "#fff", marginBottom: 2, padding: 2, borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {r.transactionDTO.description}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Categoria:</strong> {r.transactionDTO.categoryDTO.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Data:</strong> {r.competenceDate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Valor:</strong> {formatCurrency(r.amount)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Status:</strong> {r.status === 0
                            ? "Pendente"
                            : r.status === 1
                            ? "Pago"
                            : r.status === 3
                            ? "Cancelado"
                            : r.status === 4
                            ? "Deletado"
                            : "Desconhecido"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Observação:</strong> {r.metadata && r.metadata.installment && r.metadata.total_installments
                            ? `Parcela ${r.metadata.installment} / ${r.metadata.total_installments}`
                            : ""}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </>
            ) : (
              <Typography>Nenhuma transação encontrada para o filtro selecionado.</Typography> 
            )}
            {
              /*
                {summarizedInfo.length > 0 && (
                  <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>Descrição</TableCell>
                          <TableCell>Categoria</TableCell>
                          <TableCell>Valor</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>OBS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {summarizedInfo.map((r, index) => (
                          <TableRow key={index}>
                            <TableCell>{r.competenceDate}</TableCell>
                            <TableCell>{r.transactionDTO.description}</TableCell>
                            <TableCell>{r.transactionDTO.categoryDTO.name}</TableCell>
                            <TableCell>{formatCurrency(r.amount)}</TableCell>
                            <TableCell>
                              {r.status === 0
                                ? "Pendente"
                                : r.status === 1
                                ? "Pago"
                                : r.status === 3
                                ? "Pendente"
                                : r.status === 4
                                ? "Deletado"
                                : "Desconhecido"}
                            </TableCell>
                            <TableCell>
                              {r.metadata &&
                                r.metadata.installment &&
                                r.metadata.total_installments
                                ? `Parcela ${r.metadata.installment} / ${r.metadata.total_installments}`
                                : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              */
            }
          </CardContent>
        </Card>

        {/* Card 3: Expenses by Category */}
        <Card
          sx={{
            backgroundColor: "#f5f5f5",
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Movimentações por Categoria
            </Typography>

            {/* Month/Year Filter for Expenses */}
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel id="expense-month-label">Mês</InputLabel>
                <Select
                  labelId="expense-month-label"
                  value={expenseFilter.month}
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

              <FormControl fullWidth>
                <InputLabel id="expense-year-label">Ano</InputLabel>
                <Select
                  labelId="expense-year-label"
                  value={expenseFilter.year}
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
            </Box>

            {/* Gráfico de Barras Horizontais */}
            {receivablesByCategory.length > 0 && (
              <Box sx={{ marginTop: 2, height: "400px" }}>
                <NivoBarChart data={receivablesByCategory} />
              </Box>
            )}

            {/* Exibição da Tabela com Recebíveis por Categoria */}
            {receivablesByCategory.length > 0 ? (
              <Box sx={{ marginTop: 2 }}>
                {receivablesByCategory.map((r, index) => {
                  const difference =
                    r.categoryType === 'RECEIPT'
                      ? r.totalAmount - r.totalExpected
                      : r.totalExpected - r.totalAmount;

                  const percentage =
                    r.totalExpected === 0
                      ? 'n/a'
                      : `${((r.totalAmount / r.totalExpected) * 100).toFixed(2)}%`;

                  return (
                    <Card
                      key={index}
                      sx={{
                        backgroundColor: r.categoryType === 'RECEIPT' ? 'rgba(232, 255, 232, 0.7)' : 'rgb(255, 224, 224, 0.7)',
                        marginBottom: 2,
                        padding: 2,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {r.categoryName}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total Pago:</strong> {formatCurrency(r.totalPaidAmount)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total Previsto:</strong> {formatCurrency(r.totalAmount - r.totalPaidAmount)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total (Pago e Previsto):</strong> {formatCurrency(r.totalAmount)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total Orçamento:</strong> {formatCurrency(r.totalExpected)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: difference >= 0 ? 'green' : 'red',
                            fontWeight: 'bold',
                          }}
                        >
                          <strong>Diferença:</strong> {formatCurrency(difference)} ({percentage})
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            ) : (
              <Typography>Nenhum recebível encontrado para o período selecionado.</Typography>
            )}
            {
              /*
              {receivablesByCategory.length > 0 ? (
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Categoria</TableCell>
                        <TableCell>Total Pago</TableCell>
                        <TableCell>Total Previsto</TableCell>
                        <TableCell>Total (Pago e Previsto)</TableCell>
                        <TableCell>Total Orçamento</TableCell>
                        <TableCell>Diferença</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {receivablesByCategory.map((r, index) => (
                        <TableRow key={index}>
                          <TableCell>{r.categoryName}</TableCell>
                          <TableCell>{formatCurrency(r.totalAmount)}</TableCell>
                          <TableCell>{formatCurrency(r.totalPaidAmount)}</TableCell>
                          <TableCell>{formatCurrency(r.totalAmount - r.totalPaidAmount)}</TableCell>
                          <TableCell>{formatCurrency(r.totalExpected)}</TableCell>
                          <TableCell
                            style={{
                              color: r.totalExpected - r.totalAmount >= 0 ? 'green' : 'red',
                              fontWeight: 'bold',
                            }}
                          >
                            {formatCurrency(r.totalExpected - r.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>Nenhum recebível encontrado para o período selecionado.</Typography>
              )}
              */
            }
          </CardContent>
        </Card>
      </Box>

      <Modal open={transferOpenModal} onClose={handleTransferCloseModal}>
        <Box p={3} bgcolor="white" borderRadius={2} mx="auto" my={5} width={400} maxWidth="80%">
          <Typography variant="h4" gutterBottom>
            Transferência
          </Typography>

          <FormControl fullWidth margin="normal">
            <Typography variant="h6" sx={{mb: 1}}>
              Origem:
            </Typography>
            <BankDirective 
              value={fromBank}
              onChange={(newBankValue) => {
                setFromBank(Number(newBankValue));
                setToBank(0);
              }}
              multiple={false} // Apenas uma seleção
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <Typography variant="h6" sx={{mb: 1}}>
              Destino:
            </Typography>
            <BankDirective
              value={toBank}
              onChange={(newBankValue) => {
                if (Number(newBankValue) === fromBank) {
                  showSnackbar("Banco destino não pode ser igual ao banco origem!", "warning");
                  return; // Não altera o estado
                }
                setToBank(Number(newBankValue)); // Atualiza apenas se for diferente
              }}
              multiple={false} // Apenas uma seleção
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <TextField
              label="Valor (R$)"
              fullWidth
              type='number'
              value={transferAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Limita a 2 casas decimais
                const formattedValue = parseFloat(value).toFixed(2);
                setTransferAmount(Number(formattedValue));
              }}
              margin="normal"
            />
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleTransferCloseModal} sx={{ marginRight: 1 }}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleConfirmTransferAmount}>
              Confirmar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={heritageEvolutionOpenModal} onClose={handleHeritageEvolutionCloseModal}>
        <Box
          p={3}
          bgcolor="white"
          borderRadius={2}
          mx="auto"
          my={5}
          width={isMobile ? "100vw" : 1200}
          maxWidth="80%"
          maxHeight="80%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          overflow="auto"
        >
          <FormControl fullWidth margin="normal">
            <InputLabel id="fetch-heritage-evolution">Selecione o período</InputLabel>
            <Select
              labelId="fetch-heritage-evolution"
              value={heritageEvolutionFilter}
              onChange={handleHeritageEvolutionFilterChange}
            >
              <MenuItem value={3}>Últimos 3 meses</MenuItem>
              <MenuItem value={6}>Últimos 6 meses</MenuItem>
            </Select>
          </FormControl>

          {/* Gráfico de Linhas com rotação no Mobile */}
          <Box
            sx={{
              width: "100%",
              height: "80%",
              transform: isMobile ? "rotate(90deg)" : "none",
              transformOrigin: "center",
              overflow: "hidden",
            }}
          >
            {heritageEvolutionResults.length > 0 ? (
              <NivoLineChart data={heritageEvolutionResults} />
            ) : (
              <Typography>Nenhum dado encontrado para o período selecionado.</Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={handleHeritageEvolutionCloseModal} sx={{ marginRight: 1 }}>
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>
      
    </Container>
  );
};

export default Dashboard;
