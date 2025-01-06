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

  return (
    <Container>
      {isLoggedIn ? (
        <Box>
          <Typography variant="h4" align="center" gutterBottom>
            Você está logado!
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={4} md={2}>
              <Paper sx={{ padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Gráficos / Resumo</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Paper sx={{ padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Lançar Despesa / Receita</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Paper sx={{ padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Lançamentos</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Paper sx={{ padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Categorias</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Paper sx={{ padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Orçamentos</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Paper sx={{ padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Bancos e Cartões</Typography>
              </Paper>
            </Grid>
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
