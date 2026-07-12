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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import { categoryService } from "../api/categoryService";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";

const Categories = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const [newCategory, setNewCategory] = useState({
    id: null,
    name: "",
    type: 0,
  });

  const [editingCategory, setEditingCategory] = useState<any>(null);

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
        await categoryService.editCategory(updatedItem);
        search();
        closeDeleteModal();
        showSnackbar("Categoria desativada com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao atualizar item:", error);
        showSnackbar("Não foi possível desativar a categoria.", "error");
      }
    }
  };

  const search = () => {
    if (!user || !user.id) return;

    setLoadingCategories(true);
    setErrorCategories(null);

    categoryService
      .getCategoriesByUserId(user.id)
      .then((data) => {
        const sortedData = data.sort((a: any, b: any) => {
          if (a.type !== b.type) {
            return a.type - b.type;
          }
          return a.name.localeCompare(b.name);
        });

        setCategories(sortedData);
        setLoadingCategories(false);
      })
      .catch(() => {
        setErrorCategories("Erro ao carregar categorias.");
        setLoadingCategories(false);
      });
  };

  useEffect(() => {
    search();
  }, [user]);

  const openModalForCategory = (category: any = null) => {
    setEditingCategory(category);

    if (category) {
      setNewCategory({
        id: category.id,
        name: category.name,
        type: category.type,
      });
    } else {
      setNewCategory({
        id: null,
        name: "",
        type: 0,
      });
    }

    setOpenCategoryModal(true);
  };

  const handleCategorySubmit = () => {
    if (!newCategory.name.trim()) {
      showSnackbar("O nome da categoria é obrigatório.", "warning");
      return;
    }

    if (editingCategory) {
      const finalEditingCategory = { ...newCategory };

      categoryService
        .editCategory(finalEditingCategory)
        .then(() => {
          search();
          showSnackbar("Categoria editada com sucesso!", "success");
        })
        .catch(() => {
          setErrorCategories("Erro ao editar categoria.");
          showSnackbar("Não foi possível editar a categoria.", "error");
          setLoadingCategories(false);
        });
    } else {
      const finalCreatingCategory = {
        name: newCategory.name,
        type: newCategory.type,
      };

      categoryService
        .addCategory({ ...finalCreatingCategory, userId: user?.id })
        .then(() => {
          search();
          showSnackbar("Categoria criada com sucesso!", "success");
        })
        .catch(() => {
          setErrorCategories("Erro ao adicionar categoria.");
          showSnackbar("Não foi possível criar a categoria.", "error");
          setLoadingCategories(false);
        });
    }

    setOpenCategoryModal(false);
    setEditingCategory(null);
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
            Organização
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
            Categorias
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.98rem", md: "1.02rem" },
              lineHeight: 1.7,
              maxWidth: "760px",
            }}
          >
            Gerencie suas categorias de receita e despesa para manter suas
            transações organizadas e fáceis de analisar.
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
                Lista de categorias
              </Typography>

              <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                {categories.length} categoria(s) cadastrada(s).
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => openModalForCategory()}
              sx={{
                minHeight: 48,
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                boxShadow: "none",
              }}
            >
              Nova categoria
            </Button>
          </Stack>
        </Paper>

        {loadingCategories ? (
          <Box display="flex" justifyContent="center" my={6}>
            <CircularProgress />
          </Box>
        ) : errorCategories ? (
          <Alert severity="error" sx={{ borderRadius: "16px" }}>
            {errorCategories}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {categories.map((category) => {
              const isReceipt = category.type === 0;

              return (
                <Grid item xs={12} md={6} key={category.id}>
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
                    <Stack spacing={2}>
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
                            {category.name}
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
                            onClick={() => openModalForCategory(category)}
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
                            onClick={() => openModalDeleteConfirmation(category)}
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
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Modal open={openCategoryModal} onClose={() => setOpenCategoryModal(false)}>
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
              {editingCategory ? "Editar categoria" : "Nova categoria"}
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nome da categoria"
                fullWidth
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />

              <FormControl fullWidth>
                <InputLabel id="category-type-label">Tipo</InputLabel>
                <Select
                  labelId="category-type-label"
                  value={newCategory.type}
                  label="Tipo"
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      type: Number(e.target.value),
                    })
                  }
                >
                  <MenuItem value={0}>Receita</MenuItem>
                  <MenuItem value={1}>Despesa</MenuItem>
                </Select>
              </FormControl>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="flex-end"
              >
                <Button
                  variant="outlined"
                  onClick={() => setOpenCategoryModal(false)}
                >
                  Cancelar
                </Button>

                <Button variant="contained" onClick={handleCategorySubmit}>
                  {editingCategory ? "Salvar alterações" : "Adicionar categoria"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        <Dialog open={openDeleteModal} onClose={closeDeleteModal}>
          <DialogTitle>Confirmar desativação</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 1.5 }}>
              Você tem certeza que deseja desativar esta categoria?
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Tipo: {selectedItem?.type === 0 ? "Receita" : "Despesa"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Nome: {selectedItem?.name || "N/I"}
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

export default Categories;