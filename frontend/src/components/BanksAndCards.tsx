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
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { useAuth } from "../authenticationContext";
import { bankAccountService } from "../api/bankAccountService";
import { formatCurrency } from "../util/Util";
import { creditCardService } from "../api/creditCardService";
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
  AccountBalanceRounded,
  CreditCardRounded,
} from "@mui/icons-material";
import { ChromePicker } from "react-color";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";

const BanksAndCards = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);
  const [errorBanks, setErrorBanks] = useState<string | null>(null);

  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);

  const [openBankModal, setOpenBankModal] = useState(false);
  const [openCardModal, setOpenCardModal] = useState(false);

  const [color, setColor] = useState({
    hex: "#ffffff",
  });

  const [newBank, setNewBank] = useState({
    id: null,
    name: "",
    initialAmount: 0,
    color: "#000000",
  });

  const [newCard, setNewCard] = useState({
    id: null,
    name: "",
    closingDay: 1,
    payingDay: 10,
    color: "#000000",
  });

  const [editingItem, setEditingItem] = useState<any>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState("");

  const sectionCardStyle = {
    p: { xs: 2.5, md: 3 },
    borderRadius: "24px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
  };

  const openModalDeleteConfirmation = (item: any, type: string) => {
    setSelectedItem(item);
    setItemType(type);
    setOpenDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedItem(null);
    setItemType("");
  };

  const handleDeleteConfirmation = async () => {
    if (selectedItem) {
      const updatedItem = { ...selectedItem, status: 1 };

      try {
        if (itemType === "account") {
          await bankAccountService.editBankAccount(updatedItem);
        } else if (itemType === "card") {
          await creditCardService.editCreditCard(updatedItem);
        }

        search();
        closeDeleteModal();
        showSnackbar("Item desativado com sucesso!", "success");
      } catch (error) {
        console.error("Erro ao deletar item:", error);
        showSnackbar("Não foi possível desativar o item.", "error");
      }
    }
  };

  const search = () => {
    if (!user || !user.id) return;

    setLoadingBanks(true);
    setErrorBanks(null);

    bankAccountService
      .getBankAccountsByUserId(user.id)
      .then((data) => {
        setBankAccounts(data);
        setLoadingBanks(false);
      })
      .catch(() => {
        setErrorBanks("Erro ao carregar contas bancárias.");
        setLoadingBanks(false);
      });

    setLoadingCards(true);
    setErrorCards(null);

    creditCardService
      .getCreditCardsByUserId(user.id)
      .then((data) => {
        setCreditCards(data);
        setLoadingCards(false);
      })
      .catch(() => {
        setErrorCards("Erro ao carregar cartões de crédito.");
        setLoadingCards(false);
      });
  };

  useEffect(() => {
    search();
  }, [user]);

  const handleChangeComplete = (updatedColor: any) => {
    setColor(updatedColor);
  };

  const openModalForBank = (bank: any = null) => {
    setEditingItem(bank);

    if (bank) {
      setColor({ hex: bank.color });
      setNewBank({
        id: bank.id,
        name: bank.name,
        initialAmount: bank.initialAmount,
        color: bank.color,
      });
    } else {
      setColor({ hex: "#000000" });
      setNewBank({
        id: null,
        name: "",
        initialAmount: 0,
        color: "#000000",
      });
    }

    setOpenBankModal(true);
  };

  const openModalForCard = (card: any = null) => {
    setEditingItem(card);

    if (card) {
      setColor({ hex: card.color });
      setNewCard({
        id: card.id,
        name: card.name,
        closingDay: card.closingDay,
        payingDay: card.payingDay,
        color: card.color,
      });
    } else {
      setColor({ hex: "#000000" });
      setNewCard({
        id: null,
        name: "",
        closingDay: 1,
        payingDay: 10,
        color: "#000000",
      });
    }

    setOpenCardModal(true);
  };

  const handleBankSubmit = () => {
    if (!newBank.name.trim()) {
      showSnackbar("O nome do banco é obrigatório.", "warning");
      return;
    }

    const finalColor = color?.hex || newBank.color;

    if (editingItem && openBankModal) {
      const editingBank = { ...newBank, color: finalColor };

      bankAccountService
        .editBankAccount(editingBank)
        .then(() => {
          search();
          showSnackbar("Banco editado com sucesso!", "success");
        })
        .catch(() => {
          setErrorBanks("Erro ao editar conta bancária.");
          showSnackbar("Não foi possível editar o banco.", "error");
          setLoadingBanks(false);
        });
    } else {
      const creatingBank = {
        name: newBank.name,
        initialAmount: newBank.initialAmount,
        color: finalColor,
      };

      bankAccountService
        .addBankAccount({ ...creatingBank, userId: user?.id })
        .then(() => {
          search();
          showSnackbar("Banco criado com sucesso!", "success");
        })
        .catch(() => {
          setErrorBanks("Erro ao adicionar conta bancária.");
          showSnackbar("Não foi possível criar o banco.", "error");
          setLoadingBanks(false);
        });
    }

    setOpenBankModal(false);
    setEditingItem(null);
  };

  const handleCardSubmit = () => {
    if (!newCard.name.trim()) {
      showSnackbar("O nome do cartão é obrigatório.", "warning");
      return;
    }

    if (newCard.closingDay < 1 || newCard.closingDay > 31) {
      showSnackbar("O dia de fechamento deve estar entre 1 e 31.", "warning");
      return;
    }

    if (newCard.payingDay < 1 || newCard.payingDay > 31) {
      showSnackbar("O dia de pagamento deve estar entre 1 e 31.", "warning");
      return;
    }

    const finalColor = color?.hex || newCard.color;

    if (editingItem && openCardModal) {
      const editingCard = { ...newCard, color: finalColor };

      creditCardService
        .editCreditCard(editingCard)
        .then(() => {
          search();
          showSnackbar("Cartão editado com sucesso!", "success");
        })
        .catch(() => {
          setErrorCards("Erro ao editar cartão de crédito.");
          showSnackbar("Não foi possível editar o cartão.", "error");
          setLoadingCards(false);
        });
    } else {
      const creatingCard = {
        name: newCard.name,
        closingDay: newCard.closingDay,
        payingDay: newCard.payingDay,
        color: finalColor,
      };

      creditCardService
        .addCreditCard({ ...creatingCard, userId: user?.id })
        .then(() => {
          search();
          showSnackbar("Cartão criado com sucesso!", "success");
        })
        .catch(() => {
          setErrorCards("Erro ao adicionar cartão de crédito.");
          showSnackbar("Não foi possível criar o cartão.", "error");
          setLoadingCards(false);
        });
    }

    setOpenCardModal(false);
    setEditingItem(null);
  };

  const renderColorBadge = (hexColor: string) => (
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: "999px",
        backgroundColor: hexColor || "#cbd5e1",
        border: "2px solid white",
        boxShadow: "0 0 0 1px rgba(15, 23, 42, 0.10)",
      }}
    />
  );

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
            Contas
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
            Bancos e cartões
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.98rem", md: "1.02rem" },
              lineHeight: 1.7,
              maxWidth: "760px",
            }}
          >
            Gerencie suas contas bancárias e cartões de crédito com uma visualização
            mais clara, organizada e consistente.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} xl={6}>
            <Paper elevation={0} sx={sectionCardStyle}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.8 }}>
                    <AccountBalanceRounded sx={{ color: "#2563eb" }} />
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                      Contas bancárias
                    </Typography>
                  </Stack>

                  <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                    {bankAccounts.length} conta(s) cadastrada(s).
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={() => openModalForBank()}
                  sx={{
                    minHeight: 48,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.5,
                    boxShadow: "none",
                  }}
                >
                  Novo banco
                </Button>
              </Stack>

              {loadingBanks ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : errorBanks ? (
                <Alert severity="error" sx={{ borderRadius: "16px" }}>
                  {errorBanks}
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {bankAccounts.map((account) => (
                    <Paper
                      key={account.id}
                      elevation={0}
                      sx={{
                        p: 2.2,
                        borderRadius: "20px",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        backgroundColor: "#fff",
                        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
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
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                              {renderColorBadge(account.color)}
                              <Typography
                                sx={{
                                  fontSize: "1.08rem",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                }}
                              >
                                {account.name}
                              </Typography>
                            </Stack>

                            <Chip
                              label={account.status === 0 ? "Ativo" : "Inativo"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                color: account.status === 0 ? "#166534" : "#64748b",
                                backgroundColor:
                                  account.status === 0 ? "#dcfce7" : "#e2e8f0",
                              }}
                            />
                          </Box>

                          <Stack direction="row" spacing={1}>
                            <IconButton
                              onClick={() => openModalForBank(account)}
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
                              onClick={() =>
                                openModalDeleteConfirmation(account, "account")
                              }
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
                            borderRadius: "16px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid rgba(15, 23, 42, 0.06)",
                          }}
                        >
                          <Typography
                            sx={{ color: "#64748b", fontSize: "0.9rem", mb: 0.5 }}
                          >
                            Saldo inicial
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: "#0f172a",
                              fontSize: "1.2rem",
                            }}
                          >
                            {formatCurrency(account.initialAmount)}
                          </Typography>
                        </Paper>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} xl={6}>
            <Paper elevation={0} sx={sectionCardStyle}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ mb: 3 }}
              >
                <Box>
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.8 }}>
                    <CreditCardRounded sx={{ color: "#7c3aed" }} />
                    <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                      Cartões de crédito
                    </Typography>
                  </Stack>

                  <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                    {creditCards.length} cartão(ões) cadastrados.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddRounded />}
                  onClick={() => openModalForCard()}
                  sx={{
                    minHeight: 48,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.5,
                    boxShadow: "none",
                  }}
                >
                  Novo cartão
                </Button>
              </Stack>

              {loadingCards ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : errorCards ? (
                <Alert severity="error" sx={{ borderRadius: "16px" }}>
                  {errorCards}
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {creditCards.map((card) => (
                    <Paper
                      key={card.id}
                      elevation={0}
                      sx={{
                        p: 2.2,
                        borderRadius: "20px",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        backgroundColor: "#fff",
                        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
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
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.8 }}>
                              {renderColorBadge(card.color)}
                              <Typography
                                sx={{
                                  fontSize: "1.08rem",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                }}
                              >
                                {card.name}
                              </Typography>
                            </Stack>

                            <Chip
                              label={card.status === 0 ? "Ativo" : "Inativo"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                color: card.status === 0 ? "#166534" : "#64748b",
                                backgroundColor:
                                  card.status === 0 ? "#dcfce7" : "#e2e8f0",
                              }}
                            />
                          </Box>

                          <Stack direction="row" spacing={1}>
                            <IconButton
                              onClick={() => openModalForCard(card)}
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
                              onClick={() => openModalDeleteConfirmation(card, "card")}
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
                            borderRadius: "16px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid rgba(15, 23, 42, 0.06)",
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography
                                sx={{ color: "#64748b", fontSize: "0.9rem", mb: 0.5 }}
                              >
                                Fechamento
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  fontSize: "1.15rem",
                                }}
                              >
                                Dia {card.closingDay}
                              </Typography>
                            </Grid>

                            <Grid item xs={6}>
                              <Typography
                                sx={{ color: "#64748b", fontSize: "0.9rem", mb: 0.5 }}
                              >
                                Pagamento
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  fontSize: "1.15rem",
                                }}
                              >
                                Dia {card.payingDay}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Modal open={openBankModal} onClose={() => setOpenBankModal(false)}>
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
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, mb: 2.5 }}>
              {editingItem && openBankModal ? "Editar banco" : "Novo banco"}
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nome do banco"
                fullWidth
                value={newBank.name}
                onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              />

              <TextField
                label="Saldo inicial (R$)"
                fullWidth
                type="number"
                value={newBank.initialAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = parseFloat(value);
                  setNewBank({
                    ...newBank,
                    initialAmount: isNaN(parsed) ? 0 : Number(parsed.toFixed(2)),
                  });
                }}
                inputProps={{ step: "0.01" }}
              />

              <Divider />

              <Box>
                <Typography sx={{ fontWeight: 600, color: "#334155", mb: 1.2 }}>
                  Cor de identificação
                </Typography>
                <ChromePicker
                  color={color}
                  onChangeComplete={handleChangeComplete}
                  disableAlpha
                  width="100%"
                />
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setOpenBankModal(false)}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleBankSubmit}>
                  {editingItem && openBankModal ? "Salvar alterações" : "Adicionar banco"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        <Modal open={openCardModal} onClose={() => setOpenCardModal(false)}>
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
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700, mb: 2.5 }}>
              {editingItem && openCardModal ? "Editar cartão" : "Novo cartão"}
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nome do cartão"
                fullWidth
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              />

              <TextField
                label="Dia de fechamento"
                fullWidth
                type="number"
                value={newCard.closingDay}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value)) {
                    setNewCard({ ...newCard, closingDay: value });
                  }
                }}
                inputProps={{ min: 1, max: 31 }}
              />

              <TextField
                label="Dia de pagamento"
                fullWidth
                type="number"
                value={newCard.payingDay}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value)) {
                    setNewCard({ ...newCard, payingDay: value });
                  }
                }}
                inputProps={{ min: 1, max: 31 }}
              />

              <Divider />

              <Box>
                <Typography sx={{ fontWeight: 600, color: "#334155", mb: 1.2 }}>
                  Cor de identificação
                </Typography>
                <ChromePicker
                  color={color}
                  onChangeComplete={handleChangeComplete}
                  disableAlpha
                  width="100%"
                />
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setOpenCardModal(false)}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleCardSubmit}>
                  {editingItem && openCardModal ? "Salvar alterações" : "Adicionar cartão"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        <Dialog open={openDeleteModal} onClose={closeDeleteModal}>
          <DialogTitle>Confirmar desativação</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 1.5 }}>
              Você tem certeza que deseja desativar este{" "}
              {itemType === "account" ? "banco" : "cartão"}?
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

export default BanksAndCards;