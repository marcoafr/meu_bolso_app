import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Link,
} from "@mui/material";
import { login as apiLogin } from "../api/authService";
import { useAuth } from "../authenticationContext";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import { useSnackbar } from "../directives/snackbar/SnackbarContext";

const Login = () => {
  const [loginInput, setLogin] = useState("");
  const [passwordInput, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiLogin(loginInput, passwordInput);

      if (response.token) {
        login(
          {
            id: response.userId,
            name: response.name,
            email: response.email,
          },
          response.token
        );

        navigate("/home");
        showSnackbar("Login bem-sucedido!", "success");
      } else {
        setErrorMessage("Login ou senha incorretos.");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMessage("Login ou senha incorretos.");
      } else {
        setErrorMessage("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: "28px",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
          backgroundColor: "#ffffff",
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              component="img"
              src={logo}
              alt="Logo Meu Bolso"
              sx={{
                width: 88,
                height: 88,
                objectFit: "contain",
                mx: "auto",
                mb: 2,
              }}
            />

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
                fontSize: { xs: "1.75rem", sm: "2rem" },
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.1,
                mb: 1,
              }}
            >
              Entrar na sua conta
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.98rem",
                lineHeight: 1.7,
                maxWidth: 320,
                mx: "auto",
              }}
            >
              Acesse sua área financeira para acompanhar saldos, cartões,
              categorias e movimentações.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Login"
                variant="outlined"
                fullWidth
                value={loginInput}
                onChange={(e) => setLogin(e.target.value)}
                required
              />

              <TextField
                label="Senha"
                variant="outlined"
                type="password"
                fullWidth
                value={passwordInput}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {errorMessage && (
                <Alert severity="error" sx={{ borderRadius: "14px" }}>
                  {errorMessage}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{
                  mt: 1,
                  minHeight: 48,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                }}
              >
                {isLoading ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Entrar"
                )}
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: "18px",
              backgroundColor: "#f8fafc",
              border: "1px solid rgba(15, 23, 42, 0.06)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.92rem",
                color: "#475569",
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              Gostaria de criar uma conta ou contribuir no desenvolvimento do
              projeto? Envie um email para{" "}
              <Link
                href="mailto:devmarcoribeiro@gmail.com"
                underline="hover"
                sx={{ fontWeight: 700 }}
              >
                devmarcoribeiro@gmail.com
              </Link>
              .
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;