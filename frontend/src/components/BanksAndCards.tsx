import { useEffect, useState } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, CircularProgress, Alert, Modal, Button, TextField, IconButton } from '@mui/material';
import { useAuth } from '../authContext'; 
import { bankAccountService } from '../api/bankAccountService';
import { formatCurrency } from '../util/Util';
import { creditCardService } from '../api/creditCardService';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { ChromePicker } from 'react-color';

const BanksAndCards = () => {
  const { user } = useAuth(); // Pegando o user do contexto de autenticação

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
  const [newBank, setNewBank] = useState({ name: '', initialAmount: '', color: '#000000' });
  const [newCard, setNewCard] = useState({ name: '', closingDay: '', payingDay: '', color: '#000000' });
  const [editingItem, setEditingItem] = useState<any>(null); // Armazena o item sendo editado
  
  useEffect(() => {
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
  }, [user]);

  const handleChangeComplete = (updatedColor) => {
    setColor(updatedColor);
    console.log('Nova cor selecionada:', updatedColor.hex);
  };

  const openModalForBank = (bank: any = null) => {
    setEditingItem(bank);
    if (bank) {
      setColor(bank.color)
      setNewBank({ name: bank.name, initialAmount: bank.initialAmount, color: bank.color });
    } else {
      setNewBank({ name: '', initialAmount: '', color: '#000000' });
    }
    setOpenBankModal(true);
  };

  const openModalForCard = (card: any = null) => {
    setEditingItem(card);
    if (card) {
      setColor(card.color);
      setNewCard({ name: card.name, closingDay: card.closingDay, payingDay: card.payingDay, color: card.color });
    } else {
      setNewCard({ name: '', closingDay: '', payingDay: '', color: '#000000' });
    }
    setOpenCardModal(true);
  };

  const handleBankSubmit = () => {
    if (editingItem) {
      // Atualizar banco existente
      console.log('Editando banco:', newBank);
    } else {
      // Adicionar novo banco
      console.log('Adicionando banco:', newBank);
    }
    setOpenBankModal(false);
    setEditingItem(null);
  };

  const handleCardSubmit = () => {
    if (editingItem) {
      // Atualizar cartão existente
      console.log('Editando cartão:', newCard);
    } else {
      // Adicionar novo cartão
      console.log('Adicionando cartão:', newCard);
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
                </Box>
                <ListItemText
                  primary={`Valor Inicial: ${formatCurrency(account.initialAmount)}`}
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
          <Box p={3} bgcolor="white" borderRadius={2} mx="auto" my={5} width={400}>
            <Typography variant="h6">{editingItem ? 'Editar Banco' : 'Adicionar Banco'}</Typography>
            <TextField
              label="Nome do Banco"
              fullWidth
              value={newBank.name}
              onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
              margin="normal"
            />
            <TextField
              label="Saldo Inicial"
              fullWidth
              value={newBank.initialAmount}
              onChange={(e) => setNewBank({ ...newBank, initialAmount: e.target.value })}
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
              onChange={(e) => setNewCard({ ...newCard, closingDay: e.target.value })}
              margin="normal"
            />
            <TextField
              label="Dia de Pagamento"
              fullWidth
              type="number"
              value={newCard.payingDay}
              onChange={(e) => setNewCard({ ...newCard, payingDay: e.target.value })}
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
    </Container>
  );
};

export default BanksAndCards;
