// src/components/Navbar.tsx

import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authenticationContext";
import logonotext from '../images/logonotext.png';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Usando o logout do AuthContext
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/home'); // Redireciona para /home quando a imagem for clicada
  };

  // Realiza o logout usando o método do AuthContext
  const handleLogout = () => {
    logout(); // Chama o método logout do AuthContext
    navigate("/login"); // Redireciona para o login
  };

  // Função auxiliar para navegação
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Alterna o estado do menu mobile
  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  // Links para navegação
  const navigationLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Registrar Transação", path: "/registerTransaction" },
    { label: "Transações", path: "/transactions" },
    { label: "Categorias", path: "/categories" },
    { label: "Orçamentos", path: "/budgets" },
    { label: "Bancos e Cartões", path: "/banksAndCards" },
  ];

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Box
            component="img"
            src={logonotext}
            alt="Logo"
            onClick={handleLogoClick} 
            sx={{
              maxWidth: { xs: '8%', sm: '4%' },
              maxHeight: '40%',
              objectFit: 'contain',
              cursor: 'pointer',
            }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Olá, {user?.name || 'Usuário'}
          </Typography>
          {/* Menu para telas maiores */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 2 }}>
            {navigationLinks.map((link) => (
              <Button key={link.path} color="inherit" onClick={() => handleNavigation(link.path)} sx={{ flexGrow: 1 }}>
                {link.label}
              </Button>
            ))}
            <Button color="inherit" onClick={handleLogout} sx={{ ml: 'auto' }}>
              Sair
            </Button>
          </Box>

          {/* Ícone do menu para mobile */}
          <IconButton
            color="inherit"
            edge="end"
            sx={{ display: { lg: 'none' } }} // Mostra apenas no mobile
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer para telas menores */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': { width: '75%' },
        }}
      >
        <List>
          {navigationLinks.map((link) => (
            <ListItem
              key={link.path}
              component="button" // Substitui "button"
              onClick={() => {
                handleNavigation(link.path); // Navigate to the link
                toggleDrawer(); // Close the drawer
              }}
              sx={{
                textAlign: 'left',
                width: '100%',
                padding: '10px 16px',
              }}
            >
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
          <ListItem
            component="button"
            onClick={handleLogout}
            sx={{
              textAlign: 'left',
              width: '100%',
              padding: '10px 16px',
            }}
          >
            <ListItemText primary="Sair" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
