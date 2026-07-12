import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Modal,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Chip,
  Grid,
} from "@mui/material";
import { useAuth } from "../authenticationContext";
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material";
import { categoryBudgetService } from "../api/categoryBudgetService";
import { formatCurrency } from "../util/Util";
import CategoryDirective from "../directives/CategoryDirective";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";

const Budgets = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [budgets, setBudgets] = useState<any[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState<boolean>(false);
  const [errorBudgets, setErrorBudgets] = useState<string | null>(null);

  const [openBudgetModal, setOpenBudgetModal] = useState(false);

  const [newBudget, setNewBudget] = useState({
    id: null,
    amount: 0,
    categoryId: 0,
  });

  const [editingBudget, setEditingBudget] = useState<any>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const sectionCardStyle = {
    p: { xs: 2.5, md: 3 },
    borderRadius: "24px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
  };

  const openModalDeleteConfirmation = (item: any) => {
    setSelectedItem(item);
    setOpenDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedItem(null);
  };

  const handleDeleteConfirmation = async () => {
    if (selectedItem) {
      const updatedItem = { ...selectedItem, status: 1 };

      try {
        await categoryBudgetService.editCategoryBudget(updatedItem);
        search();
        showSnackbar("Orçamento desativado com sucesso!", "success");
        closeDeleteModal();
      } catch (error) {
        console.error("Erro ao atualizar item:", error);
        showSnackbar("Não foi possível desativar o orçamento.", "error");
      }
    }
  };

  const search = () => {
    if (!user || !user.id) return;

    setLoadingBudgets(true);
    setErrorBudgets(null);

    categoryBudgetService
      .getCategoryBudgetsByUserId(user.id)
      .then((data) => {
        setBudgets(data);
        setLoadingBudgets(false);
      })
      .catch(() => {
        setErrorBudgets("Erro ao carregar orçamentos.");
        setLoadingBudgets(false);
      });
  };

  useEffect(() => {
    search();
  }, [user]);

  const openModalForBudget = (budget: any = null) => {
    setEditingBudget(budget);

    if (budget) {
      setNewBudget({
        id: budget.id,
        amount: budget.amount,
        categoryId: budget.categoryId,
      });
    } else {
      setNewBudget({
        id: null,
        amount: 0,
        categoryId: 0,
      });
    }

    setOpenBudgetModal(true);
  };

  const handleBudgetSubmit = () => {
    if (!newBudget.categoryId || newBudget.categoryId <= 0) {
      showSnackbar("A categoria é obrigatória.", "warning");
      return;
    }

    if (!newBudget.amount || newBudget.amount <= 0) {
      showSnackbar("O valor do orçamento deve ser maior que zero.", "warning");
      return;
    }

    if (editingBudget) {
      const finalEditingBudget = { ...newBudget };

      categoryBudgetService
        .editCategoryBudget(finalEditingBudget)
        .then(() => {
          search();
          showSnackbar("Orçamento editado com sucesso!", "success");
        })
        .catch(() => {
          setErrorBudgets("Erro ao editar orçamento.");
          showSnackbar("Não foi possível editar o orçamento.", "error");
          setLoadingBudgets(false);
        });
    } else {
      const finalCreatingBudget = {
        amount: newBudget.amount,
        categoryId: newBudget.categoryId,
      };

      categoryBudgetService
        .addCategoryBudget({ ...finalCreatingBudget, userId: user?.id })
        .then(() => {
          search();
          showSnackbar("Orçamento criado com sucesso!", "success");
        })
        .catch(() => {
          setErrorBudgets("Erro ao adicionar orçamento.");
          showSnackbar("Não foi possível criar o orçamento.", "error");
          setLoadingBudgets(false);
        });
    }

    setOpenBudgetModal(false);
    setEditingBudget(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="lg">
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
            Planejamento
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
            Orçamentos
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.98rem", md: "1.02rem" },
              lineHeight: 1.7,
              maxWidth: "760px",
            }}
          >
            Gerencie seus limites por categoria para acompanhar melhor seus gastos e
            receitas planejadas.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ ...sectionCardStyle, mb: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 0.5,
                }}
              >
                Lista de orçamentos
              </Typography>

              <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                {budgets.length} orçamento(s) cadastrado(s).
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => openModalForBudget()}
              sx={{
                minHeight: 48,
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                boxShadow: "none",
              }}
            >
              Novo orçamento
            </Button>
          </Stack>
        </Paper>

        {loadingBudgets ? (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress />
          </Box>
        ) : errorBudgets ? (
          <Alert severity="error" sx={{ borderRadius: "16px" }}>
            {errorBudgets}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {budgets.map((budget) => {
              const isReceipt = budget.categoryType === 0;

              return (
                <Grid item xs={12} md={6} key={budget.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "24px",
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 12px 32px rgba(15, 23, 42, 0.05)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
                      },
                    }}
                  >
                    <Stack spacing={2.2}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap={2}
                        flexWrap="wrap"
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "1.15rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              lineHeight: 1.25,
                              mb: 0.8,
                            }}
                          >
                            {budget.categoryName}
                          </Typography>

                          <Chip
                            label={isReceipt ? "Receita" : "Despesa"}
                            sx={{
                              fontWeight: 700,
                              color: isReceipt ? "#166534" : "#b91c1c",
                              backgroundColor: isReceipt ? "#dcfce7" : "#fee2e2",
                            }}
                          />
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => openModalForBudget(budget)}
                            sx={{
                              bgcolor: "rgba(37, 99, 235, 0.10)",
                              color: "#2563eb",
                              "&:hover": {
                                bgcolor: "rgba(37, 99, 235, 0.18)",
                              },
                            }}
                          >
                            <EditRounded />
                          </IconButton>

                          <IconButton
                            onClick={() => openModalDeleteConfirmation(budget)}
                            sx={{
                              bgcolor: "rgba(239, 68, 68, 0.10)",
                              color: "#dc2626",
                              "&:hover": {
                                bgcolor: "rgba(239, 68, 68, 0.18)",
                              },
                            }}
                          >
                            <DeleteOutlineRounded />
                          </IconButton>
                        </Stack>
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
                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: "0.92rem",
                            mb: 0.6,
                          }}
                        >
                          Valor planejado
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "1.35rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            lineHeight: 1.2,
                          }}
                        >
                          {formatCurrency(budget.amount)}
                        </Typography>
                      </Paper>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Modal open={openBudgetModal} onClose={() => setOpenBudgetModal(false)}>
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
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#0f172a",
                mb: 2.5,
              }}
            >
              {editingBudget ? "Editar orçamento" : "Novo orçamento"}
            </Typography>

            <Stack spacing={2}>
              <CategoryDirective
                multiple={false}
                value={newBudget.categoryId}
                onChange={(categoryId) => {
                  setNewBudget({
                    ...newBudget,
                    categoryId: +categoryId,
                  });
                }}
                includeTypeOnName={true}
              />

              <TextField
                label="Valor (R$)"
                fullWidth
                type="number"
                value={newBudget.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = parseFloat(value);
                  setNewBudget({
                    ...newBudget,
                    amount: isNaN(parsed) ? 0 : Number(parsed.toFixed(2)),
                  });
                }}
                inputProps={{ step: "0.01", min: 0 }}
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  onClick={() => setOpenBudgetModal(false)}
                >
                  Cancelar
                </Button>

                <Button variant="contained" onClick={handleBudgetSubmit}>
                  {editingBudget ? "Salvar alterações" : "Adicionar orçamento"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        <Dialog open={openDeleteModal} onClose={closeDeleteModal}>
          <DialogTitle>Confirmar desativação</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 1.5 }}>
              Você tem certeza que deseja desativar este orçamento?
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Categoria: {selectedItem?.categoryName || "N/I"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Valor: {selectedItem ? formatCurrency(selectedItem.amount) : "N/I"}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteModal}>Cancelar</Button>
            <Button onClick={handleDeleteConfirmation} color="error" variant="contained">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Budgets;