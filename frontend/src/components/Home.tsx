import { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Stack,
  Avatar,
} from "@mui/material";
import {
  DashboardRounded,
  ReceiptLongRounded,
  SwapHorizRounded,
  CategoryRounded,
  SavingsRounded,
  AccountBalanceWalletRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardRounded />,
      description: "Visualize seu resumo financeiro e os principais indicadores.",
    },
    {
      label: "Registrar transação",
      path: "/registerTransaction",
      icon: <ReceiptLongRounded />,
      description: "Adicione receitas, despesas e movimentações financeiras.",
    },
    {
      label: "Transações",
      path: "/transactions",
      icon: <SwapHorizRounded />,
      description: "Consulte e acompanhe seu histórico financeiro.",
    },
    {
      label: "Categorias",
      path: "/categories",
      icon: <CategoryRounded />,
      description: "Organize suas transações com categorias personalizadas.",
    },
    {
      label: "Orçamentos",
      path: "/budgets",
      icon: <SavingsRounded />,
      description: "Defina limites e acompanhe seus gastos do mês.",
    },
    {
      label: "Bancos e cartões",
      path: "/banksAndCards",
      icon: <AccountBalanceWalletRounded />,
      description: "Gerencie contas, cartões e formas de pagamento.",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
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
        {isLoggedIn ? (
          <>
            <Box sx={{ mb: { xs: 4, md: 5 } }}>
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
                Meu Bolso
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "2rem", md: "2.6rem" },
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.1,
                  mb: 1.2,
                }}
              >
                Bem-vindo de volta
              </Typography>

              <Typography
                sx={{
                  maxWidth: "680px",
                  color: "#64748b",
                  fontSize: { xs: "0.98rem", md: "1.02rem" },
                  lineHeight: 1.7,
                }}
              >
                Acesse rapidamente as principais áreas da sua vida financeira com
                uma interface mais clara, moderna e organizada.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {menuItems.map((item) => (
                <Grid item xs={12} sm={6} lg={4} key={item.path}>
                  <Paper
                    elevation={0}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      p: 3,
                      borderRadius: "24px",
                      cursor: "pointer",
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      backgroundColor: "#ffffff",
                      transition: "all 0.25s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
                        borderColor: "rgba(25, 118, 210, 0.25)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "primary.main",
                        boxShadow: "0 10px 24px rgba(25, 118, 210, 0.20)",
                      }}
                    >
                      {item.icon}
                    </Avatar>

                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.label}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#64748b",
                          fontSize: "0.98rem",
                          lineHeight: 1.65,
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box
            sx={{
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              Redirecionando...
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;