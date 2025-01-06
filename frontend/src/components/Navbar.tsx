// src/components/Navbar.tsx

import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Usando o logout do AuthContext
  
  // Realiza o logout usando o método do AuthContext
  const handleLogout = () => {
    logout(); // Chama o método logout do AuthContext
    navigate("/login"); // Redireciona para o login
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Olá, {user?.name || 'Usuário'}
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
