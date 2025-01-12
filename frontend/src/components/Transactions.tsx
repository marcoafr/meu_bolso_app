import { Typography, Container, Box, Button, Grid, Card, CardContent, IconButton, Tooltip, Chip, Menu, MenuItem, Select, InputLabel, FormControl, CircularProgress, TextField, Modal, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";
import DateDirective from "../directives/DateDirective";
import CategoryDirective from "../directives/CategoryDirective";
import CardDirective from "../directives/CardDirective";
import BankDirective from "../directives/BankDirective";
import PaymentStatusDirective from "../directives/PaymentStatusDirective";
import { receivableService } from "../api/receivableService";
import { Check, Edit, Clear, Delete } from "@mui/icons-material";
import { formatCurrency, formatDate } from "../util/Util";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";
import TransactionTypeDirective from "../directives/TransactionTypeDirective";
import CategoryEntityDirective from "../directives/CategoryEntityDirective";

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

  // Modal Liquidação
  const [openModalLiquidation, setOpenModalLiquidation] = useState<boolean>(false); // Controla a exibição do modal
  const [selectedReceivableLiquidation, setSelectedReceivableLiquidation] = useState<number | null>(null); // Armazena o banco selecionado
  const [selectedBankAccountLiquidation, setSelectedBankAccountLiquidation] = useState<number | null>(null); // Armazena o banco selecionado
  const [paymentDateLiquidation, setPaymentDateLiquidation] = useState(new Date().toISOString().split("T")[0]); // Data de pagamento padrão (hoje)

  // Modal Edição
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessages, setDialogMessages] = useState<string[]>([]);

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
    handleSort(); // Chama a função de ordenação
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
    setSelectedReceivableLiquidation(id); // Armazena o id da transação
    setSelectedBankAccountLiquidation(null); // Reseta o banco selecionado
    setPaymentDateLiquidation(new Date().toISOString().split("T")[0]); // Define a data de pagamento como hoje
    setOpenModalLiquidation(true); // Abre o modal
  };

  const handleModalCloseLiquidation = () => {
    setOpenModalLiquidation(false); // Fecha o modal
  };
  
  const handleConfirmLiquidation = () => {
    if (selectedBankAccountLiquidation && paymentDateLiquidation) {
      receivableService.liquidate({receivableId: selectedReceivableLiquidation, bankAccountId: selectedBankAccountLiquidation, paymentDate: paymentDateLiquidation})
        .then(() => {
          showSnackbar("Liquidação realizada com sucesso", "success");
          handleModalCloseLiquidation(); // Fecha o modal após a liquidação
          handleSearch();
        })
        .catch(() => {
          showSnackbar("Erro ao liquidar", "error");
        });
    }
  };

  const handleEdit = (receivable: any) => {
    setEditData({
      ...receivable,
      /*
      transactionDTO: {
        ...receivable.transactionDTO, 
        categoryDTO: {
          ...receivable.transactionDTO.categoryDTO
        }
      },
      */
      updatedAmount: receivable.amount,
      updatedCategory: {...receivable.transactionDTO.categoryDTO},
      originalCategoryName: receivable.transactionDTO.categoryDTO.name,
      updatedCompetenceDate: receivable.competenceDate,
    });
    setOpenEditModal(true);
  };
  
  const handleEditSave = () => {
    const messages = [];
    console.log("editData", editData)
    if (editData.amount !== editData.updatedAmount) {
      messages.push(
        `Alterar valor de R$ ${formatCurrency(editData.amount)} para R$ ${formatCurrency(editData.updatedAmount)}.`
      );
    }
    if (editData.transactionDTO.categoryDTO.id !== editData.updatedCategory.id) {
      messages.push(
        `Alterar categoria de "${editData.transactionDTO.categoryDTO.name}" para "${editData.updatedCategory.name}". Isso irá alterar a categoria de todas as parcelas dessa compra, caso seja parcelada.`
      );
    }
    if (editData.competenceDate !== editData.updatedCompetenceDate) {
      messages.push(
        `Alterar data de competência de ${formatDate(editData.competenceDate)} para ${formatDate(editData.updatedCompetenceDate)}.`
      );
    }
  
    if (messages.length > 0) {
      setDialogMessages(messages);
      setIsDialogOpen(true); // Abre o Dialog
    } else {
      showSnackbar("Nenhuma alteração foi feita.", "info");
    }
  };  

  // Função para confirmar a alteração
  const confirmEdit = () => {
    receivableService
      .updateTransaction(editData.id, {
        amount: editData.updatedAmount,
        categoryId: editData.updatedCategory,
        competenceDate: editData.updatedCompetenceDate,
      })
      .then(() => {
        showSnackbar("Alterações salvas com sucesso!", "success");
        setOpenEditModal(false);
        handleSearch(); // Atualize a lista de transações
      })
      .catch(() => {
        showSnackbar("Erro ao salvar alterações.", "error");
      })
      .finally(() => setIsDialogOpen(false)); // Fecha o Dialog após a confirmação
  };
  
  const handleEditClose = () => {
    setOpenEditModal(false);
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
            <TransactionTypeDirective
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
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box flexGrow={1}>
                      {r.bankName && <Typography variant="body1">Banco: {r.bankName}</Typography>}
                    </Box>
                    <Box display="flex" justifyContent="flex-end">
                      {r.status === 3 || r.status === 1 ? (
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
                            <IconButton onClick={() => handleEdit(r)} color="primary">
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
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Modal de Liquidação */}
      <Modal open={openModalLiquidation} onClose={handleModalCloseLiquidation}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", 
          bgcolor: "background.paper", padding: 4, borderRadius: 2, boxShadow: 3
        }}>
          <Typography variant="h6" gutterBottom>Liquidar Transação</Typography>

          <BankDirective
            value={selectedBankAccountLiquidation ? [selectedBankAccountLiquidation] : []}
            multiple={false}
            onChange={(value) => setSelectedBankAccountLiquidation(Array.isArray(value) ? value[0] : value)}
          />

          <TextField
            label="Data de Pagamento"
            type="date"
            value={paymentDateLiquidation}
            onChange={(e) => setPaymentDateLiquidation(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <Box display="flex" justifyContent="space-between" sx={{ mt: 2, gap: 2 }}>
            <Button variant="outlined" onClick={handleModalCloseLiquidation}>Fechar</Button>
            <Button variant="contained" color="primary" onClick={handleConfirmLiquidation}>Confirmar</Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal de Edição */}
      <Modal open={openEditModal} onClose={handleEditClose}>
        <Box sx={{ width: 400, padding: 4, margin: "auto", mt: 10, backgroundColor: "white", borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Editar Transação
          </Typography>
          <TextField
            label="Valor"
            type="number"
            fullWidth
            value={editData?.updatedAmount || ""}
            onChange={(e) => setEditData({ ...editData, updatedAmount: parseFloat(e.target.value) })}
            sx={{ mb: 2 }}
          />
          <Typography variant="body1" gutterBottom>
            Categoria original: {editData?.originalCategoryName}
          </Typography>
          <CategoryEntityDirective
            multiple={false} // Seleção única
            showOnlyReceiptOrExpense={
              editData?.transactionDTO?.categoryDTO?.type === 0 ? "receipt" : "expense"
            } // Define o tipo de categoria com base no type
            value={editData?.updatedCategory} // Valor atual como entidade ou null
            onChange={(newValue) => {
              console.log("newValue", newValue)
              setEditData({
                ...editData,
                updatedCategory: newValue,
              });
            }} // Atualiza o estado com a nova categoria
          />
          <TextField
            label="Data de Competência"
            type="date"
            fullWidth
            value={editData?.updatedCompetenceDate || ""}
            onChange={(e) => setEditData({ ...editData, updatedCompetenceDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{mt: 2}}
          />
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Button variant="outlined" color="secondary" onClick={handleEditClose}>
              Cancelar
            </Button>
            <Button variant="contained" color="primary" onClick={handleEditSave}>
              Salvar Alterações
            </Button>
          </Box>
        </Box>

      </Modal>
        {/* Seu código existente */}
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <DialogTitle id="confirm-dialog-title">Confirmar Alterações</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              Você está prestes a:
              <ul>
              {dialogMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
            Deseja confirmar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={confirmEdit} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Transactions;
