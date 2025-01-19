import { useEffect, useState } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, CircularProgress, Alert, Modal, Button, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useAuth } from '../authenticationContext'; 
import { bankAccountService } from '../api/bankAccountService';
import { formatCurrency } from '../util/Util';
import { creditCardService } from '../api/creditCardService';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useSnackbar } from '../directives/snackbar/SnackbarContext';

const BanksAndCards = () => {
  const { user } = useAuth(); // Pegando o user do contexto de autenticação
  const { showSnackbar } = useSnackbar(); // Usando o hook do Snackbar

  // Estados para bancos
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);
  const [errorBanks, setErrorBanks] = useState<string | null>(null);

  // Estados para cartões de crédito
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(false);
  const [errorCards, setErrorCards] = useState<string | null>(null);

  // Estados para modais
  const [openBankModal, setOpenBankModal] = useState(false);
  const [openCardModal, setOpenCardModal] = useState(false);
  const [color, setColor] = useState({
    hex: '#ffffff',
  });

  // Estados para formulários
  const [newBank, setNewBank] = useState({ id: null, name: '', initialAmount: 0, color: '#000000' });
  const [newCard, setNewCard] = useState({ id: null, name: '', closingDay: 1, payingDay: 10, color: '#000000' });
  const [editingItem, setEditingItem] = useState<any>(null); // Armazena o item sendo editado

  // Estados para inativação
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState(""); // Para distinguir entre account e card

  // Função para abrir o modal de exclusão e definir o item selecionado
  const openModalDeleteConfirmation = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setOpenDeleteModal(true);
  };
  
  // Função para fechar o modal
  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedItem(null);
    setItemType("");
  };

  // Função para excluir ou inativar o item
  const handleDeleteConfirmation = async () => {
    if (selectedItem) {
      const updatedItem = { ...selectedItem, status: 1 }; // Define o status como 1 (inactive)

      try {
        if (itemType === "account") {
          // Atualiza a conta
          await bankAccountService.editBankAccount(updatedItem);
        } else if (itemType === "card") {
          // Aqui você chamaria o serviço para editar o cartão, similar ao editBankAccount
          await creditCardService.editCreditCard(updatedItem); // Ajuste conforme necessário
        }
        // Fechar o modal após a ação
        search();
        closeDeleteModal();
        showSnackbar("Deleção bem-sucedida!", "success"); 
        // Realize outras ações, como atualizar o estado ou mostrar sucesso
      } catch (error) {
        console.error("Erro ao deletar o item:", error);
        // Aqui você pode adicionar uma mensagem de erro ou outras ações
        showSnackbar("Deleção mal-sucedida!", "error"); 
      }
    }
  };

  const search = () => {
    // Busca bancos e cartões de crédito do usuário
    if (!user || !user.id) return; // Se o user não estiver disponível, não faz a requisição

    // Carregamento dos bancos
    setLoadingBanks(true);
    bankAccountService
      .getBankAccountsByUserId(user.id)
      .then((data) => {
        setBankAccounts(data);
        setLoadingBanks(false);
      })
      .catch(() => {
        setErrorBanks('Erro ao carregar contas bancárias');
        setLoadingBanks(false);
      });

    // Carregamento dos cartões de crédito
    setLoadingCards(true);
    creditCardService
      .getCreditCardsByUserId(user.id)
      .then((data) => {
        setCreditCards(data);
        setLoadingCards(false);
      })
      .catch(() => {
        setErrorCards('Erro ao carregar cartões de crédito');
        setLoadingCards(false);
      });
  }
  
  useEffect(() => {
    search()
  }, [user]);

  const handleChangeComplete = (updatedColor) => {
    setColor(updatedColor);
  };

  const openModalForBank = (bank: any = null) => {
    setEditingItem(bank);
    if (bank) {
      setColor(bank.color)
      setNewBank({ id: bank.id, name: bank.name, initialAmount: bank.initialAmount, color: bank.color });
    } else {
      setNewBank({ id: null, name: '', initialAmount: 0, color: '#000000' });
    }
    setOpenBankModal(true);
  };

  const openModalForCard = (card: any = null) => {
    setEditingItem(card);
    if (card) {
      setColor(card.color);
      setNewCard({ id: card.id, name: card.name, closingDay: card.closingDay, payingDay: card.payingDay, color: card.color });
    } else {
      setNewCard({ id: null, name: '', closingDay: 1, payingDay: 10, color: '#000000' });
    }
    setOpenCardModal(true);
  };

  const handleBankSubmit = () => {
    if (editingItem) {
      // Atualizar banco existente
      const editingBank = {...newBank, color: color?.hex || color.hex || newBank.color} 
      bankAccountService
        .editBankAccount(editingBank)
        .then((data) => {
          search();
          showSnackbar("Edição bem-sucedida!", "success"); 
        })
        .catch(() => {
          setErrorBanks('Erro ao editar conta bancária');
          showSnackbar("Edição bem-sucedida!", "error"); 
          setLoadingBanks(false);
        });
    } else {
      // Adicionar novo banco
      const creatingBank = {name: newBank.name, initialAmount: newBank.initialAmount, color: color.hex} 
      bankAccountService
        .addBankAccount({...creatingBank, userId: user?.id})
        .then((data) => {
          search();
          showSnackbar("Criação bem-sucedida!", "success"); 
        })
        .catch(() => {
          setErrorBanks('Erro ao adicionar conta bancária');
          showSnackbar("Criação mal-sucedida!", "error"); 
          setLoadingBanks(false);
        });    
    }
    setOpenBankModal(false);
    setEditingItem(null);
  };

  const handleCardSubmit = () => {
    if (editingItem) {
      // Atualizar cartão existente
      const editingCard = {...newCard, color: color?.hex || color || newCard.color}
      creditCardService
        .editCreditCard(editingCard)
        .then((data) => {
          search();
          showSnackbar("Edição bem-sucedida!", "success"); 
        })
        .catch(() => {
          setErrorCards('Erro ao editar cartão de crédito');
          showSnackbar("Edição mal-sucedida!", "error"); 
          setLoadingBanks(false);
        });
    } else {
      // Adicionar novo cartão
      const creatingCard = {name: newCard.name, closingDay: newCard.closingDay, payingDay: newCard.payingDay, color: color.hex}
      creditCardService
        .addCreditCard({...creatingCard, userId: user?.id})
        .then((data) => {
          search();
          showSnackbar("Criação bem-sucedida!", "success"); 
        })
        .catch(() => {
          setErrorCards('Erro ao adicionar cartão de crédito');
          showSnackbar("Criação mal-sucedida!", "error"); 
          setLoadingBanks(false);
        });  
    }
    setOpenCardModal(false);
    setEditingItem(null);
  };

  return (
    <Container>
      {/* Sessão de bancos */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4">Bancos</Typography>
          <IconButton color="primary" onClick={() => openModalForBank()}>
            <AddIcon />
          </IconButton>
        </Box>

        {loadingBanks ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : errorBanks ? (
          <Alert severity="error">{errorBanks}</Alert>
        ) : (
          <List sx={{width: '100%'}}>
            {bankAccounts.map((account) => (
              <ListItem
                key={account.id}
                sx={{
                  backgroundColor: account.color || '#f4f4f4',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  padding: '10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: account.color ? `${account.color}80` : '#f0f0f0',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ListItemText
                    primary={`Banco: ${account.name}`}
                    secondary={`Status: ${account.status === 0 ? 'Ativo' : 'Inativo'}`}
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      padding: '5px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Box sx={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '5px', 
                    marginLeft: '5px' 
                  }}>
                    <IconButton color="primary" onClick={() => openModalForBank(account)}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '5px', 
                    marginLeft: '5px' 
                  }}>
                    <IconButton color="primary" onClick={() => openModalDeleteConfirmation(account, "account")}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <ListItemText
                  primary={`Saldo Inicial: ${formatCurrency(account.initialAmount)}`}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    padding: '5px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
        {/* Modal de adicionar/editar banco */}
        <Modal open={openBankModal} onClose={() => setOpenBankModal(false)}>
          <Box p={3} bgcolor="white" borderRadius={2} mx="auto" my={5} width={400} maxWidth="80%">
            <Typography variant="h6">{editingItem ? 'Editar Banco' : 'Adicionar Banco'}</Typography>
            <TextField
              label="Nome do Banco"
              fullWidth
              value={newBank.name}
              onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              margin="normal"
            />
            <TextField
              label="Saldo Inicial (R$)"
              fullWidth
              type='number'
              value={newBank.initialAmount}
              onChange={(e) => {
                const value = e.target.value;
                // Limita a 2 casas decimais
                const formattedValue = parseFloat(value).toFixed(2);
                setNewBank({ ...newBank, initialAmount: Number(formattedValue) });
              }}
              margin="normal"
            />
            <ChromePicker
              color={color}
              onChangeComplete={handleChangeComplete}
              disableAlpha
              width="100%"
            />
            <Button variant="contained" fullWidth onClick={handleBankSubmit}>
              {editingItem ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </Box>
        </Modal>

      </Box>

      {/* Sessão de cartões de crédito */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h4">Cartões de Crédito</Typography>
          <IconButton color="primary" onClick={() => openModalForCard()}>
            <AddIcon />
          </IconButton>
        </Box>

        {loadingCards ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : errorCards ? (
          <Alert severity="error">{errorCards}</Alert>
        ) : (
          <List sx={{width: '100%'}}>
            {creditCards.map((card) => (
              <ListItem
                key={card.id}
                sx={{
                  backgroundColor: card.color || '#f4f4f4',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  padding: '10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: card.color ? `${card.color}80` : '#f0f0f0',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ListItemText
                    primary={`Banco: ${card.name}`}
                    secondary={`Status: ${card.status === 0 ? 'Ativo' : 'Inativo'}`}
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: '4px',
                      padding: '5px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Box sx={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '5px', 
                    marginLeft: '5px' 
                  }}>
                    <IconButton color="primary" onClick={() => openModalForCard(card)}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '5px', 
                    marginLeft: '5px' 
                  }}>
                    <IconButton color="primary" onClick={() => openModalDeleteConfirmation(card, "card")}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <ListItemText
                  primary={`Dia de fechamento: ${card.closingDay} | Dia de pagamento: ${card.payingDay}`}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    padding: '5px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Modal de adicionar cartão */}
        <Modal open={openCardModal} onClose={() => setOpenCardModal(false)}>
          <Box p={3} bgcolor="white" borderRadius={2} mx="auto" my={5} width={400}>
            <Typography variant="h6">{editingItem ? 'Editar cartão de crédito' : 'Adicionar cartão de crédito'}</Typography>
            <TextField
              label="Nome do Cartão"
              fullWidth
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              margin="normal"
            />
            <TextField
              label="Dia de Fechamento"
              fullWidth
              type="number"
              value={newCard.closingDay}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value >= 1 && value <= 31) {
                  setNewCard({ ...newCard, closingDay: value });
                }
              }}
              margin="normal"
            />
            <TextField
              label="Dia de Pagamento"
              fullWidth
              type="number"
              value={newCard.payingDay}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value >= 1 && value <= 31) {
                  setNewCard({ ...newCard, payingDay: value });
                }
              }}
              margin="normal"
            />
            <ChromePicker
              color={color}
              onChangeComplete={handleChangeComplete}
              disableAlpha
              width="100%"
            />
            <Button variant="contained" fullWidth onClick={handleCardSubmit}>
              {editingItem ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </Box>
        </Modal>
      </Box>
      
      {/* Modal de Confirmação */}
      <Dialog open={openDeleteModal} onClose={closeDeleteModal}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Você tem certeza que deseja desativar este {itemType === "account" ? "conta" : "cartão"}?</p>
          <p>Nome: {selectedItem != null ? selectedItem?.name : "N/I"}?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal} color="primary">Cancelar</Button>
          <Button onClick={handleDeleteConfirmation} color="secondary">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BanksAndCards;
