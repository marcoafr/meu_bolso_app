import { useEffect, useState } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, CircularProgress, Alert, Modal, Button, TextField, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useAuth } from '../authContext'; 
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { categoryService } from '../api/categoryService';

const Categories = () => {
  const { user } = useAuth(); // Pegando o user do contexto de autenticação

  // Estados para categorias
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  // Estados para modais
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  // Estados para formulários
  const [newCategory, setNewCategory] = useState({ id: null, name: '', type: 0 });
  const [editingCategory, setEditingCategory] = useState<any>(null); 

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
        await categoryService.editCategory(updatedItem);
        // Fechar o modal após a ação
        search();
        closeDeleteModal();
        // Realize outras ações, como atualizar o estado ou mostrar sucesso
      } catch (error) {
        console.error("Erro ao atualizar o item:", error);
        // Aqui você pode adicionar uma mensagem de erro ou outras ações
      }
    }
  };

  const search = () => {
    // Busca categorias do usuário
    if (!user || !user.id) return; // Se o user não estiver disponível, não faz a requisição

    // Carregamento das categorias
    setLoadingCategories(true);
    categoryService
      .getCategoriesByUserId(user.id)
      .then((data) => {
        // Ordenar os dados primeiro por 'type' (0 antes de 1) e depois por 'name'
        const sortedData = data.sort((a, b) => {
          // Ordena por 'type' (0 primeiro, depois 1)
          if (a.type !== b.type) {
            return a.type - b.type;
          }
          // Se 'type' for igual, ordena por 'name'
          return a.name.localeCompare(b.name);
        });

        setCategories(sortedData);
        setLoadingCategories(false);
      })
      .catch(() => {
        setErrorCategories('Erro ao carregar categorias');
        setLoadingCategories(false);
      });
  }
  
  useEffect(() => {
    search()
  }, [user]);

  const openModalForCategory = (category: any = null) => {
    setEditingCategory(category);
    if (category) {
      setNewCategory({ id: category.id, name: category.name, type: category.type });
    } else {
      setNewCategory({ id: null, name: '', type: 0 });
    }
    setOpenCategoryModal(true);
  };

  const handleCategorySubmit = () => {
    if (editingCategory) {
      // Atualizar categoria existente
      const finalEditingCategory = {...newCategory} 
      categoryService
        .editCategory(finalEditingCategory)
        .then((data) => {
          search();
        })
        .catch(() => {
          setErrorCategories('Erro ao editar categoria');
          setLoadingCategories(false);
        });
    } else {
      // Adicionar nova categoria
      const finalCreatingCategory = {name: newCategory.name, type: newCategory.type } 
      categoryService
        .addCategory({...finalCreatingCategory, userId: user?.id})
        .then((data) => {
          search();
        })
        .catch(() => {
          setErrorCategories('Erro ao adicionar categoria');
          setLoadingCategories(false);
        });    
    }
    setOpenCategoryModal(false);
    setEditingCategory(null);
  };

  return (
    <Container>
      {/* Sessão de categorias */}
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4">Categorias</Typography>
          <IconButton color="primary" onClick={() => openModalForCategory()}>
            <AddIcon />
          </IconButton>
        </Box>

        {loadingCategories ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : errorCategories ? (
          <Alert severity="error">{errorCategories}</Alert>
        ) : (
          <List sx={{width: '100%'}}>
            {categories.map((category) => (
              <ListItem
                key={category.id}
                sx={{
                  backgroundColor: category.type == 0 ? '#bcff70' : '#fd7557',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  padding: '10px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    backgroundColor: category.type == 0 ? '#bcff7080' : '#fd755780',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ListItemText
                    primary={`Categoria: ${category.name}`}
                    secondary={`Tipo: ${category.type == 0 ? 'Receita' : 'Despesa'}`}
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
                    <IconButton color="primary" onClick={() => openModalForCategory(category)}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '5px', 
                    marginLeft: '5px' 
                  }}>
                    <IconButton color="primary" onClick={() => openModalDeleteConfirmation(category)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
        {/* Modal de adicionar/editar categoria */}
        <Modal open={openCategoryModal} onClose={() => setOpenCategoryModal(false)}>
          <Box p={3} bgcolor="white" borderRadius={2} mx="auto" my={5} width={400}>
            <Typography variant="h6">{editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}</Typography>
            <TextField
              label="Nome da Categoria"
              fullWidth
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-type-label">Tipo</InputLabel>
              <Select
                labelId="category-type-label"
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: Number(e.target.value) })}
                label="Tipo"
              >
                <MenuItem value={0}>Receita</MenuItem>
                <MenuItem value={1}>Despesa</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" fullWidth onClick={handleCategorySubmit}>
              {editingCategory ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </Box>
        </Modal>
      </Box>

      {/* Modal de Confirmação */}
      <Dialog open={openDeleteModal} onClose={closeDeleteModal}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Você tem certeza que deseja desativar esta categoria?</p>
          <p>Tipo: {selectedItem?.type == 0 ? 'Receita' : "Despesa"}?</p>
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

export default Categories;