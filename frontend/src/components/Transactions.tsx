import {
  Typography,
  Container,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  TextField,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { useState } from "react";
import DateDirective from "../directives/DateDirective";
import CategoryDirective from "../directives/CategoryDirective";
import CardDirective from "../directives/CardDirective";
import BankDirective from "../directives/BankDirective";
import PaymentStatusDirective from "../directives/PaymentStatusDirective";
import { receivableService } from "../api/receivableService";
import {
  Check,
  Edit,
  Clear,
  Delete,
  FilterListRounded,
  SortRounded,
} from "@mui/icons-material";
import { formatCurrency, formatDate, formatArrayDate } from "../util/Util";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";
import TransactionTypeDirective from "../directives/TransactionTypeDirective";
import CategoryEntityDirective from "../directives/CategoryEntityDirective";
import { useAuth } from "../authenticationContext";

const Transactions = () => {
  const { showSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatLocalDate = (date: Date) => date.toISOString().split("T")[0];

    return {
      from: formatLocalDate(yesterday),
      to: formatLocalDate(today),
      transactionType: null as number | null,
      categories: [] as number[],
      bankAccounts: [] as number[],
      creditCards: [] as number[],
      status: [] as number[],
      userId: user?.id,
    };
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState<string>("dataD");
  const [loading, setLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [openModalLiquidation, setOpenModalLiquidation] = useState<boolean>(false);
  const [selectedReceivableLiquidation, setSelectedReceivableLiquidation] = useState<number | null>(null);
  const [selectedBankAccountLiquidation, setSelectedBankAccountLiquidation] = useState<number | null>(null);
  const [paymentDateLiquidation, setPaymentDateLiquidation] = useState(new Date().toISOString().split("T")[0]);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessages, setDialogMessages] = useState<string[]>([]);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransactionCancelDelete, setSelectedTransactionCancelDelete] = useState<any>(null);

  const handleCancel = (recei: any) => {
    setSelectedTransactionCancelDelete(recei);
    setOpenCancelDialog(true);
  };

  const handleDelete = (recei: any) => {
    setSelectedTransactionCancelDelete(recei);
    setOpenDeleteDialog(true);
  };

  const confirmCancel = () => {
    receivableService
      .cancelReceivable(selectedTransactionCancelDelete!.id)
      .then(() => {
        showSnackbar("Transação cancelada com sucesso!", "success");
        setOpenCancelDialog(false);
        handleSearch();
      })
      .catch(() => {
        showSnackbar("Erro ao cancelar transação", "error");
      });
  };

  const confirmDelete = () => {
    receivableService
      .deleteReceivable(selectedTransactionCancelDelete!.id)
      .then(() => {
        showSnackbar("Transação deletada com sucesso!", "success");
        setOpenDeleteDialog(false);
        handleSearch();
      })
      .catch(() => {
        showSnackbar("Erro ao deletar transação", "error");
      });
  };

  const closeDialogCancelDelete = () => {
    setOpenCancelDialog(false);
    setOpenDeleteDialog(false);
  };

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
        const sortedData = data.sort(
          (a: any, b: any) =>
            new Date(b.competenceDate).getTime() - new Date(a.competenceDate).getTime()
        );

        const processedData = sortedData.map((item: any) => {
          if (item.metadata) {
            try {
              item.metadata = JSON.parse(item.metadata);
            } catch (error) {
              console.error("Erro ao parsear metadata:", error);
              item.metadata = {};
            }
          }
          return item;
        });

        setTransactions(processedData);
      })
      .catch(() => {
        showSnackbar("Erro ao buscar transações", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (value: string) => {
    setSortOption(value);
    setAnchorEl(null);
    handleSort(value);
  };

  const handleSort = (sortValue: string) => {
    let sortedData = [...transactions];

    switch (sortValue) {
      case "dataC":
        sortedData.sort(
          (a: any, b: any) =>
            new Date(a.competenceDate).getTime() - new Date(b.competenceDate).getTime()
        );
        break;
      case "dataD":
        sortedData.sort(
          (a: any, b: any) =>
            new Date(b.competenceDate).getTime() - new Date(a.competenceDate).getTime()
        );
        break;
      case "valorC":
        sortedData.sort((a: any, b: any) => a.amount - b.amount);
        break;
      case "valorD":
        sortedData.sort((a: any, b: any) => b.amount - a.amount);
        break;
      case "categoriaC":
        sortedData.sort((a: any, b: any) =>
          a.transactionDTO.categoryName.localeCompare(b.transactionDTO.categoryName)
        );
        break;
      case "categoriaD":
        sortedData.sort((a: any, b: any) =>
          b.transactionDTO.categoryName.localeCompare(a.transactionDTO.categoryName)
        );
        break;
      default:
        break;
    }

    setTransactions(sortedData);
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return "Pendente";
      case 1:
        return "Pago";
      case 3:
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const getStatusStyles = (status: number) => {
    switch (status) {
      case 0:
        return {
          color: "#b45309",
          backgroundColor: "#fef3c7",
        };
      case 1:
        return {
          color: "#166534",
          backgroundColor: "#dcfce7",
        };
      case 3:
        return {
          color: "#b91c1c",
          backgroundColor: "#fee2e2",
        };
      default:
        return {
          color: "#475569",
          backgroundColor: "#e2e8f0",
        };
    }
  };

  const handleLiquidate = (receivable: any) => {
    setSelectedReceivableLiquidation(receivable.id);
    setSelectedBankAccountLiquidation(receivable.bankId);
    setPaymentDateLiquidation(new Date().toISOString().split("T")[0]);
    setOpenModalLiquidation(true);
  };

  const handleModalCloseLiquidation = () => {
    setOpenModalLiquidation(false);
    setSelectedBankAccountLiquidation(null);
  };

  const handleConfirmLiquidation = () => {
    if (selectedBankAccountLiquidation && paymentDateLiquidation) {
      receivableService
        .liquidate({
          receivableId: selectedReceivableLiquidation,
          bankAccountId: selectedBankAccountLiquidation,
          paymentDate: paymentDateLiquidation,
        })
        .then(() => {
          showSnackbar("Liquidação realizada com sucesso", "success");
          handleModalCloseLiquidation();
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
      updatedAmount: receivable.amount,
      updatedCategory: { ...receivable.transactionDTO.categoryDTO },
      originalCategoryName: receivable.transactionDTO.categoryDTO.name,
      updatedCompetenceDate: receivable.competenceDate,
    });
    setOpenEditModal(true);
  };

  const handleEditSave = () => {
    const messages = [];

    if (editData.amount !== editData.updatedAmount) {
      messages.push(
        `Alterar valor de R$ ${formatCurrency(editData.amount)} para R$ ${formatCurrency(
          editData.updatedAmount
        )}.`
      );
    }

    if (editData.transactionDTO.categoryDTO.id !== editData.updatedCategory.id) {
      messages.push(
        `Alterar categoria de "${editData.transactionDTO.categoryDTO.name}" para "${editData.updatedCategory.name}". Isso irá alterar a categoria de todas as parcelas dessa compra, caso seja parcelada.`
      );
    }

    if (editData.competenceDate !== editData.updatedCompetenceDate) {
      messages.push(
        `Alterar data de competência de ${formatDate(editData.competenceDate)} para ${formatDate(
          editData.updatedCompetenceDate
        )}.`
      );
    }

    if (messages.length > 0) {
      setDialogMessages(messages);
      setIsDialogOpen(true);
    } else {
      showSnackbar("Nenhuma alteração foi feita.", "info");
    }
  };

  const confirmEdit = () => {
    receivableService
      .updateReceivable({
        receivableId: editData.id,
        amount: editData.updatedAmount,
        categoryId: editData.updatedCategory.id,
        competenceDate: editData.updatedCompetenceDate,
      })
      .then(() => {
        showSnackbar("Alterações salvas com sucesso!", "success");
        setOpenEditModal(false);
        handleSearch();
      })
      .catch(() => {
        showSnackbar("Erro ao salvar alterações.", "error");
      })
      .finally(() => setIsDialogOpen(false));
  };

  const handleEditClose = () => {
    setOpenEditModal(false);
  };

  const isInstallment = (transaction: any): boolean => {
    return (
      transaction &&
      transaction.metadata &&
      "installment" in transaction.metadata &&
      "total_installments" in transaction.metadata
    );
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
            Financeiro
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
            Transações
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.98rem", md: "1.02rem" },
              lineHeight: 1.7,
              maxWidth: "780px",
            }}
          >
            Filtre, consulte e gerencie suas transações com mais clareza, incluindo
            ações rápidas para editar, liquidar, cancelar ou excluir lançamentos.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ ...sectionCardStyle, mb: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
                Filtros
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                Refine sua busca por período, tipo, categoria, conta, cartão e status.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={4}>
                <DateDirective
                  initialDates={{ from: filters.from, to: filters.to }}
                  onChange={(dates) => {
                    handleFilterChange("from", dates.from);
                    handleFilterChange("to", dates.to);
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <TransactionTypeDirective
                  value={filters.transactionType!}
                  onChange={(value) => handleFilterChange("transactionType", value)}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <CategoryDirective
                  value={filters.categories}
                  multiple
                  onChange={(value) => handleFilterChange("categories", value)}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <BankDirective
                  value={filters.bankAccounts}
                  multiple
                  onChange={(value) => handleFilterChange("bankAccounts", value)}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <CardDirective
                  value={filters.creditCards}
                  multiple
                  onChange={(value) => handleFilterChange("creditCards", value)}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={4}>
                <PaymentStatusDirective
                  value={filters.status}
                  multiple
                  onChange={(value) => handleFilterChange("status", value)}
                />
              </Grid>
            </Grid>

            <Divider />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={18} color="inherit" /> : <FilterListRounded />
                }
                sx={{
                  minHeight: 48,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.5,
                  boxShadow: "none",
                }}
              >
                {loading ? "Pesquisando..." : "Pesquisar"}
              </Button>

              <Button
                variant="outlined"
                onClick={handleMenuClick}
                disabled={loading || transactions.length === 0}
                startIcon={<SortRounded />}
                sx={{
                  minHeight: 48,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2.5,
                }}
              >
                Classificar:{" "}
                {sortOption === "dataC"
                  ? "Data (crescente)"
                  : sortOption === "dataD"
                  ? "Data (decrescente)"
                  : sortOption === "valorC"
                  ? "Valor (crescente)"
                  : sortOption === "valorD"
                  ? "Valor (decrescente)"
                  : sortOption === "categoriaC"
                  ? "Categoria (crescente)"
                  : "Categoria (decrescente)"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => handleMenuClose("dataC")}>Data crescente</MenuItem>
          <MenuItem onClick={() => handleMenuClose("dataD")}>Data decrescente</MenuItem>
          <MenuItem onClick={() => handleMenuClose("valorC")}>Valor crescente</MenuItem>
          <MenuItem onClick={() => handleMenuClose("valorD")}>Valor decrescente</MenuItem>
          <MenuItem onClick={() => handleMenuClose("categoriaC")}>Categoria crescente</MenuItem>
          <MenuItem onClick={() => handleMenuClose("categoriaD")}>Categoria decrescente</MenuItem>
        </Menu>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>
            Resultados
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
            {transactions.length} transação(ões) encontrada(s).
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {transactions.map((r) => {
            const isReceipt = r.transactionDTO.categoryDTO.type === 0;
            const statusStyle = getStatusStyles(r.status);

            return (
              <Grid item xs={12} md={6} xl={4} key={r.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: "24px",
                    border: "1px solid rgba(15, 23, 42, 0.08)",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap={1.5}
                        flexWrap="wrap"
                      >
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip
                            label={isReceipt ? "Receita" : "Despesa"}
                            sx={{
                              fontWeight: 700,
                              color: isReceipt ? "#166534" : "#b91c1c",
                              backgroundColor: isReceipt ? "#dcfce7" : "#fee2e2",
                            }}
                          />
                          <Chip
                            label={getStatusLabel(r.status)}
                            sx={{
                              fontWeight: 700,
                              color: statusStyle.color,
                              backgroundColor: statusStyle.backgroundColor,
                            }}
                          />
                        </Stack>

                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {formatArrayDate(r.competenceDate)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: 1.3,
                            mb: 0.6,
                          }}
                        >
                          {r.transactionDTO.description}
                        </Typography>

                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                          }}
                        >
                          Categoria: {r.transactionDTO.categoryName}
                        </Typography>
                      </Box>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: "18px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid rgba(15, 23, 42, 0.06)",
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography
                            sx={{
                              fontSize: "1.25rem",
                              fontWeight: 800,
                              color: isReceipt ? "#166534" : "#b91c1c",
                            }}
                          >
                            {isReceipt ? "+" : "-"} {formatCurrency(r.amount)}
                          </Typography>

                          {isInstallment(r) && (
                            <Typography sx={{ color: "#64748b", fontSize: "0.92rem" }}>
                              Parcela {r.metadata.installment}/{r.metadata.total_installments}
                            </Typography>
                          )}

                          {r.bankName && (
                            <Typography sx={{ color: "#475569", fontSize: "0.92rem" }}>
                              Banco: {r.bankName}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>

                      <Divider />

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1.5}
                      >
                        <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                          ID #{r.id}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          {r.status === 3 || r.status === 1 ? (
                            <Tooltip title="Deletar">
                              <IconButton
                                onClick={() => handleDelete(r)}
                                sx={{
                                  bgcolor: "rgba(239, 68, 68, 0.10)",
                                  color: "#dc2626",
                                  "&:hover": {
                                    bgcolor: "rgba(239, 68, 68, 0.18)",
                                  },
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip title="Liquidar">
                                <IconButton
                                  onClick={() => handleLiquidate(r)}
                                  sx={{
                                    bgcolor: "rgba(34, 197, 94, 0.12)",
                                    color: "#16a34a",
                                    "&:hover": {
                                      bgcolor: "rgba(34, 197, 94, 0.20)",
                                    },
                                  }}
                                >
                                  <Check />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Editar">
                                <IconButton
                                  onClick={() => handleEdit(r)}
                                  sx={{
                                    bgcolor: "rgba(37, 99, 235, 0.10)",
                                    color: "#2563eb",
                                    "&:hover": {
                                      bgcolor: "rgba(37, 99, 235, 0.18)",
                                    },
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Cancelar">
                                <IconButton
                                  onClick={() => handleCancel(r)}
                                  sx={{
                                    bgcolor: "rgba(239, 68, 68, 0.10)",
                                    color: "#dc2626",
                                    "&:hover": {
                                      bgcolor: "rgba(239, 68, 68, 0.18)",
                                    },
                                  }}
                                >
                                  <Clear />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Modal open={openModalLiquidation} onClose={handleModalCloseLiquidation}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "92%", sm: 520 },
              bgcolor: "background.paper",
              p: 3,
              borderRadius: "24px",
              boxShadow: 24,
            }}
          >
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, mb: 2 }}>
              Liquidar transação
            </Typography>

            <Stack spacing={2}>
              <BankDirective
                value={selectedBankAccountLiquidation!}
                multiple={false}
                onChange={(value) =>
                  setSelectedBankAccountLiquidation(Array.isArray(value) ? value[0] : value)
                }
              />

              <TextField
                label="Data de pagamento"
                type="date"
                value={paymentDateLiquidation}
                onChange={(e) => setPaymentDateLiquidation(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleModalCloseLiquidation}>
                  Fechar
                </Button>
                <Button variant="contained" onClick={handleConfirmLiquidation}>
                  Confirmar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        <Modal open={openEditModal} onClose={handleEditClose}>
          <Box
            sx={{
              width: { xs: "92%", sm: 520 },
              p: 3,
              mx: "auto",
              mt: 8,
              backgroundColor: "white",
              borderRadius: "24px",
              boxShadow: 24,
            }}
          >
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, mb: 2.5 }}>
              Editar transação
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Valor"
                type="number"
                fullWidth
                value={editData?.updatedAmount || ""}
                onChange={(e) =>
                  setEditData({ ...editData, updatedAmount: parseFloat(e.target.value) })
                }
              />

              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Categoria original: {editData?.originalCategoryName}
              </Typography>

              <CategoryEntityDirective
                multiple={false}
                showOnlyReceiptOrExpense={
                  editData?.transactionDTO?.categoryDTO?.type === 0 ? "receipt" : "expense"
                }
                value={editData?.updatedCategory}
                onChange={(newValue) => {
                  setEditData({
                    ...editData,
                    updatedCategory: newValue,
                  });
                }}
              />

              <TextField
                label="Data de competência"
                type="date"
                fullWidth
                value={editData?.updatedCompetenceDate || ""}
                onChange={(e) =>
                  setEditData({ ...editData, updatedCompetenceDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                <Button variant="outlined" color="secondary" onClick={handleEditClose}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleEditSave}>
                  Salvar alterações
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <DialogTitle>Confirmar alterações</DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
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
            <Button onClick={confirmEdit} autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openCancelDialog} onClose={closeDialogCancelDelete}>
          <DialogTitle>Confirmar cancelamento</DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
              Você tem certeza de que deseja cancelar esta transação?
              {isInstallment(selectedTransactionCancelDelete) && (
                <Box sx={{ mt: 2 }}>
                  <strong>Atenção:</strong> Esta transação é parcelada. O cancelamento desta
                  parcela irá cancelar todas as outras parcelas associadas.
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialogCancelDelete} color="secondary">
              Voltar
            </Button>
            <Button onClick={confirmCancel} autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openDeleteDialog} onClose={closeDialogCancelDelete}>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
              Você tem certeza de que deseja deletar esta transação?
              {isInstallment(selectedTransactionCancelDelete) && (
                <Box sx={{ mt: 2 }}>
                  <strong>Atenção:</strong> Esta transação é parcelada. A exclusão desta parcela
                  irá deletar todas as outras parcelas associadas.
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialogCancelDelete} color="secondary">
              Voltar
            </Button>
            <Button onClick={confirmDelete} autoFocus>
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Transactions;