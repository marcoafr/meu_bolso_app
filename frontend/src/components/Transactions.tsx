import { Typography, Container, Box, Button, Grid, Card, CardContent, IconButton, Tooltip, Chip, Menu, MenuItem, Select, InputLabel, FormControl, CircularProgress } from "@mui/material";
import { useState } from "react";
import DateDirective from "../directives/DateDirective";
import TransactionTypeFilter from "../directives/TransactionTypeDirective";
import CategoryDirective from "../directives/CategoryDirective";
import CardDirective from "../directives/CardDirective";
import BankDirective from "../directives/BankDirective";
import PaymentStatusDirective from "../directives/PaymentStatusDirective";
import { receivableService } from "../api/receivableService";
import { Check, Edit, Clear, Delete } from "@mui/icons-material";
import { formatCurrency, formatDate } from "../util/Util";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";

const Transactions = () => {
  const { showSnackbar } = useSnackbar(); // Usando o hook do Snackbar
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    return {
      from: formatDate(yesterday),
      to: formatDate(today),
      transactionType: null as number | null,
      categories: [] as number[],
      bankAccounts: [] as number[],
      creditCards: [] as number[],
      status: [] as number[],
    };
  });

  const [transactions, setTransactions] = useState<any[]>([]); // Armazena as transações
  const [sortOption, setSortOption] = useState<string>("data"); // Estado para armazenar a opção de classificação
  const [loading, setLoading] = useState<boolean>(false); // Estado para controle de loading
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Estado para controle do Menu

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: Array.isArray(value) ? [...value] : value,
    }));
  };

  const handleSearch = () => {
    setLoading(true);
    receivableService
      .getAnalyticalListReceivableByUserId(filters)
      .then((data) => {
        // Ordenar os dados por competenceDate (mais novo para mais velho)
        const sortedData = data.sort(
          (a: any, b: any) =>
            new Date(b.competenceDate).getTime() - new Date(a.competenceDate).getTime()
        );
        setTransactions(sortedData); // Salva as transações no estado
      })
      .catch(() => {
        showSnackbar("Erro ao buscar transações", "error");
      })
      .finally(() => {
        setLoading(false); // Desativa o estado de loading após a busca
      });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Abre o menu
  };

  const handleMenuClose = (value: string) => {
    setSortOption(value); // Atualiza a opção de classificação
    setAnchorEl(null); // Fecha o menu
  };

  const handleSort = () => {
    let sortedData = [...transactions];

    switch (sortOption) {
      case "data":
        sortedData.sort((a: any, b: any) =>
          new Date(a.competenceDate).getTime() - new Date(b.competenceDate).getTime()
        );
        break;
      case "valor":
        sortedData.sort((a: any, b: any) => a.amount - b.amount);
        break;
      case "categoria":
        sortedData.sort((a: any, b: any) =>
          a.transactionDTO.categoryName.localeCompare(b.transactionDTO.categoryName)
        );
        break;
      default:
        break;
    }

    setTransactions(sortedData); // Atualiza a lista de transações
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "orange"; // Pendente
      case 1:
        return "green"; // Pago
      case 3:
        return "red"; // Cancelado
      default:
        return "gray"; // Desconhecido
    }
  };

  const handleLiquidate = (id: number) => {
    console.log("Liquidar", id);
  };

  const handleEdit = (id: number) => {
    console.log("Editar", id);
  };

  const handleCancel = (id: number) => {
    console.log("Cancelar", id);
  };

  const handleDelete = (id: number) => {
    console.log("Deletar", id);
  };

  return (
    <Container>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Transações
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DateDirective
              initialDates={{ from: filters.from, to: filters.to }}
              onChange={(dates) => {
                handleFilterChange("from", dates.from);
                handleFilterChange("to", dates.to);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TransactionTypeFilter
              value={filters.transactionType!}
              onChange={(value) => handleFilterChange("transactionType", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CategoryDirective
              value={filters.categories}
              multiple
              onChange={(value) => handleFilterChange("categories", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BankDirective
              value={filters.bankAccounts}
              multiple
              onChange={(value) => handleFilterChange("bankAccounts", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardDirective
              value={filters.creditCards}
              multiple
              onChange={(value) => handleFilterChange("creditCards", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PaymentStatusDirective
              value={filters.status}
              multiple
              onChange={(value) => handleFilterChange("status", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Pesquisar"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleMenuClick}
              style={{ marginLeft: "10px" }}
              disabled={loading || transactions.length === 0}
            >
              Classificar por: {sortOption === "data" ? "Data" : sortOption === "valor" ? "Valor" : "Categoria"}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => handleMenuClose("data")}>Data</MenuItem>
              <MenuItem onClick={() => handleMenuClose("valor")}>Valor</MenuItem>
              <MenuItem onClick={() => handleMenuClose("categoria")}>Categoria</MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Box>
      <Box mt={4}>
        <Grid container spacing={2}>
          {transactions.map((r) => (
            <Grid item xs={12} sm={6} key={r.id}>
              <Card
                sx={{
                  backgroundColor: r.transactionDTO.categoryDTO.type === 0 ? "#e8f5e9" : "#ffebee", // Verde claro para receita, vermelho claro para despesa
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={r.transactionDTO.categoryDTO.type === 0 ? "RECEITA" : "DESPESA"}
                      color={r.transactionDTO.categoryDTO.type === 0 ? "success" : "error"}
                      variant="outlined"
                    />
                    <Typography variant="body1" color={getStatusColor(r.status)} sx={{ml: 2, fontWeight: 'bold'}}>
                      Status: {r.status === 0 ? "Pendente" : r.status === 1 ? "Pago" : "Cancelado"}
                    </Typography>
                    <Typography variant="body1" color="textSecondary" textAlign="right">
                      Data: {formatDate(r.competenceDate)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" color="textSecondary" sx={{fontWeight: 'bold'}}>
                      Valor: {formatCurrency(r.amount)}
                    </Typography>
                    <Typography variant="body1" textAlign="right">Categoria: {r.transactionDTO.categoryName}</Typography>
                  </Box>
                  {r.bankName && <Typography variant="body1">Banco: {r.bankName}</Typography>}
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    {r.status === 3 ? (
                      <Tooltip title="Deletar">
                        <IconButton onClick={() => handleDelete(r.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <>
                        <Tooltip title="Liquidar">
                          <IconButton onClick={() => handleLiquidate(r.id)} color="success">
                            <Check />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleEdit(r.id)} color="primary">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton onClick={() => handleCancel(r.id)} color="error">
                            <Clear />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Transactions;
