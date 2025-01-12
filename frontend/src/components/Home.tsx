// src/components/Home.tsx

import { useEffect, useState } from "react";
import { Typography, Container, Grid, Paper, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redireciona para a página de login se não houver token
    } else {
      setIsLoggedIn(true); // Se o token estiver presente, o usuário está logado
    }
  }, [sessionStorage]);

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Registrar Transação", path: "/registerTransaction" },
    { label: "Transações", path: "/transactions" },
    { label: "Categorias", path: "/categories" },
    { label: "Orçamentos", path: "/budgets" },
    { label: "Bancos e Cartões", path: "/banksAndCards" },
  ];

  const handleNavigation = (path) => {
    navigate(path); // Realiza a navegação para o path passado
  };

  return (
    <Container>
      {isLoggedIn ? (
        <Box>
          <Typography variant="h4" align="center" gutterBottom>
            Bem-vindo!
          </Typography>
          <Grid container spacing={2} justifyContent="center">
          {menuItems.map((item) => (
            <Grid item xs={12} key={item.path}>
              <Paper 
                sx={{
                  padding: 2,
                  textAlign: "center",
                  cursor: 'pointer',
                  backgroundColor: '#f5f5f5' // Cor de fundo cinza claro
                }} 
                onClick={() => handleNavigation(item.path)} // Navega ao clicar no Paper
              >
                <Typography variant="h6">{item.label}</Typography>
              </Paper>
            </Grid>
          ))}
          </Grid>
        </Box>
      ) : (
        <Typography variant="h5" align="center">
          Redirecionando...
        </Typography>
      )}
    </Container>
  );
};

export default Home;
