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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { dashboardService } from "../api/dashboardService";
import { formatCurrency, formatArrayDate } from "../util/Util";
import { useAuth } from "../authenticationContext";
import CardDirective from "../directives/CardDirective";
import { creditCardService } from "../api/creditCardService";
import { receivableService } from "../api/receivableService";

interface BankAccountBalance {
  id: number;
  name: string;
  currentBalance: number;
}

const Dashboard = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccountBalance[]>([]);
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
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

  // Fetch current balance
  useEffect(() => {
    const fetchCurrentBalance = async () => {
      try {
        const data = await dashboardService.currentBalance(user?.id);
        setBankAccounts(data);
      } catch (error) {
        console.error("Erro ao buscar os saldos atuais:", error);
      }
    };

    fetchCurrentBalance();
  }, [user]);

  // Effect to monitor changes in filters
  useEffect(() => {
    if (!selectedCard) {
      return; // Não faz a consulta se selectedCard for null ou 0
    }
  
    if (selectedCard && selectedCard > 0 && selectedMonthYear.month && selectedMonthYear.year) {
      creditCardService.summarizedInfo({
          creditCardId: selectedCard!,
          month: selectedMonthYear.month,
          year: selectedMonthYear.year,
          userId: user?.id!,
        }).then((data) => {
          if (data.length > 0) {
            data.forEach((r) => {
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
            <Typography variant="h5" gutterBottom>
              Saldo Atual
            </Typography>
            {bankAccounts.length > 0 ? (
              bankAccounts.map((account) => (
                <Typography key={account.id}>
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
              <CardDirective
                value={selectedCard!}
                onChange={(newCard) => setSelectedCard(Number(newCard))}
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

            {/* Tabela transformada em uma lista para mobile */}
            {summarizedInfo.length > 0 ? (
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
                          ? "Pendente"
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

            {/* Exibição da Tabela com Recebíveis por Categoria */}
            {receivablesByCategory.length > 0 ? (
              <Box sx={{ marginTop: 2 }}>
                {receivablesByCategory.map((r, index) => (
                  <Card key={index} sx={{ backgroundColor: "#fff", marginBottom: 2, padding: 2, borderRadius: 2 }}>
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
                      <Typography variant="body2" sx={{
                        color: r.totalExpected - r.totalAmount >= 0 ? 'green' : 'red',
                        fontWeight: 'bold',
                      }}>
                        <strong>Diferença:</strong> {formatCurrency(r.totalExpected - r.totalAmount)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
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
    </Container>
  );
};

export default Dashboard;
