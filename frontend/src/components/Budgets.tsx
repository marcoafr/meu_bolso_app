import { useEffect, useState } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, CircularProgress, Alert, Modal, Button, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useAuth } from '../authenticationContext'; 
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { categoryBudgetService } from '../api/categoryBudgetService';
import { formatCurrency } from '../util/Util';
import CategoryDirective from '../directives/CategoryDirective';
import { useSnackbar } from '../directives/snackbar/SnackbarContext';

const Budgets = () => {
  const { user } = useAuth(); // Pegando o user do contexto de autenticação
  const { showSnackbar } = useSnackbar(); // Usando o hook do Snackbar

  // Estados para orçamentos
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState<boolean>(false);
  const [errorBudgets, setErrorBudgets] = useState<string | null>(null);

  // Estados para modais
  const [openBudgetModal, setOpenBudgetModal] = useState(false);

  // Estados para formulários
  const [newBudget, setNewBudget] = useState({ id: null, amount: 0, categoryId: 0 });
  const [editingBudget, setEditingBudget] = useState<any>(null); 

  // Estados para inativação
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Função para abrir o modal de exclusão e definir o item selecionado
  const openModalDeleteConfirmation = (item) => {
    setSelectedItem(item);
    setOpenDeleteModal(true);
  };
  
  // Função para fechar o modal
  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedItem(null);
  };

  // Função para excluir ou inativar o item
  const handleDeleteConfirmation = async () => {
    if (selectedItem) {
      const updatedItem = { ...selectedItem, status: 1 }; // Define o status como 1 (inactive)

      try {
        await categoryBudgetService.editCategoryBudget(updatedItem);
        // Fechar o modal após a ação
        search();
        showSnackbar("LEdição bem-sucedida!", "success"); 
        closeDeleteModal();
        // Realize outras ações, como atualizar o estado ou mostrar sucesso
      } catch (error) {
        console.error("Erro ao atualizar o item:", error);
        // Aqui você pode adicionar uma mensagem de erro ou outras ações
        showSnackbar("Edição mal-sucedida!", "error"); 
      }
    }
  };

  const search = () => {
    // Busca categorias do usuário
    if (!user || !user.id) return; // Se o user não estiver disponível, não faz a requisição

    // Carregamento das categorias
    setLoadingBudgets(true);
    categoryBudgetService
      .getCategoryBudgetsByUserId(user.id)
      .then((data) => {
        setBudgets(data);
        setLoadingBudgets(false);
      })
      .catch(() => {
        setErrorBudgets('Erro ao carregar orçamentos');
        setLoadingBudgets(false);
      });
  }
  
  useEffect(() => {
    search()
  }, [user]);

  const openModalForBudget = (budget: any = null) => {
    setEditingBudget(budget);
    if (budget) {
      setNewBudget({ id: budget.id, amount: budget.amount, categoryId: budget.categoryId });
    } else {
      setNewBudget({ id: null, amount: 0, categoryId: 0 });
    }
    setOpenBudgetModal(true);
  };

  const handleBudgetSubmit = () => {
    if (editingBudget) {
      // Atualizar categoria existente
      const finalEditingBudget = {...newBudget} 
      categoryBudgetService
        .editCategoryBudget(finalEditingBudget)
        .then((data) => {
          search();
        })
        .catch(() => {
          setErrorBudgets('Erro ao editar orçamento');
          setLoadingBudgets(false);
        });
    } else {
      // Adicionar nova categoria
      const finalCreatingBudget = {amount: newBudget.amount, categoryId: newBudget.categoryId} 
      categoryBudgetService
        .addCategoryBudget({...finalCreatingBudget, userId: user?.id})
        .then((data) => {
          search();
          showSnackbar("Criação bem-sucedida!", "success"); 
        })
        .catch(() => {
          setErrorBudgets('Erro ao adicionar categoria');
          showSnackbar("Criação mal-sucedida!", "error"); 
          setLoadingBudgets(false);
        });    
    }
    setOpenBudgetModal(false);
    setEditingBudget(null);
  };

  return (
    <Container>
      {/* Sessão de orçamentos */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4">Orçamentos</Typography>
          <IconButton color="primary" onClick={() => openModalForBudget()}>
            <AddIcon />
          </IconButton>
        </Box>

        {loadingBudgets ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : errorBudgets ? (
          <Alert severity="error">{errorBudgets}</Alert>
        ) : (
          <List sx={{width: '100%'}}>
            {budgets.map((budget) => (
              <ListItem
                key={budget.id}
                sx={{
                  backgroundColor: budget.categoryType == 0 ? '#bcff70' : '#fd7557',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  padding: '10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: budget.categoryType == 0 ? '#bcff7080' : '#fd755780',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ListItemText
                    primary={`Categoria: ${budget.categoryName}`}
                    secondary={`Tipo: ${budget.categoryType === 0 ? 'Receita' : 'Despesa'}`}
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
                    <IconButton color="primary" onClick={() => openModalForBudget(budget)}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '5px', 
                    marginLeft: '5px' 
                  }}>
                    <IconButton color="primary" onClick={() => openModalDeleteConfirmation(budget)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <ListItemText
                  primary={`Valor: ${formatCurrency(budget.amount)}`}
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
        {/* Modal de adicionar/editar orçamento */}
        <Modal open={openBudgetModal} onClose={() => setOpenBudgetModal(false)}>
          <Box p={3} bgcolor="white" borderRadius={2} mx="auto" my={5} width={400} maxWidth="80%">
            <Typography variant="h6">{editingBudget ? 'Editar Orçamento' : 'Adicionar Orçamento'}</Typography>
            <CategoryDirective
              multiple={false} // Apenas uma categoria pode ser selecionada
              value={newBudget.categoryId} // Categoria atual do orçamento
              onChange={(categoryId) => {
                setNewBudget({ ...newBudget, categoryId: + categoryId })
              }} // Atualiza o estado
              includeTypeOnName={true} // Incluir "Despesa" ou "Receita" no nome
            />
            <TextField
              label="Valor (R$)"
              fullWidth
              type='number'
              value={newBudget.amount}
              onChange={(e) => {
                const value = e.target.value;
                // Limita a 2 casas decimais
                const formattedValue = parseFloat(value).toFixed(2);
                setNewBudget({ ...newBudget, amount: Number(formattedValue) });
              }}
              margin="normal"
            />
            <Button variant="contained" fullWidth onClick={handleBudgetSubmit}>
              {editingBudget ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </Box>
        </Modal>
      </Box>

      {/* Modal de Confirmação */}
      <Dialog open={openDeleteModal} onClose={closeDeleteModal}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Você tem certeza que deseja desativar este orçamento?</p>
          <p>Categoria: {selectedItem?.categoryId}</p>
          <p>Valor: {formatCurrency(selectedItem?.amount)}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteModal} color="primary">Cancelar</Button>
          <Button onClick={handleDeleteConfirmation} color="secondary">Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Budgets;