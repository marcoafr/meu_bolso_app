// src/components/Login.tsx

import { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { login as apiLogin } from "../api";  // Função de login da API
import { useAuth } from "../authContext";  // Função de login do AuthContext
import { useNavigate } from "react-router-dom";
import logo from '../images/logo.png';

const Login = () => {
  const [loginInput, setLogin] = useState("");
  const [passwordInput, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // Login do AuthContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Realiza o login na API
      const response = await apiLogin(loginInput, passwordInput);

      // 2. Verifica se a resposta contém um token
      if (response.token) {
        // 3. Se o login for bem-sucedido, armazena os dados no contexto de autenticação
        login({
          id: response.userId, // Ajuste de acordo com a resposta da API
          name: response.name,
          email: response.email,
        }, response.token); // Passando token também

        // 4. Redireciona o usuário para a página principal
        navigate("/home");
      } else {
        setErrorMessage("Login ou senha incorretos");
      }
    } catch (error: any) {
      // 5. Caso haja erro, exibe a mensagem correspondente
      if (error.response?.status === 401) {
        setErrorMessage("Login ou senha incorretos");
      } else {
        setErrorMessage("Ocorreu um erro. Tente novamente.");
      }
    }
  };

  return (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: {
                xs: '100%',    // Para dispositivos móveis, ocupa 100% da largura
                sm: '30%',     // Para telas maiores, ocupa 30% da largura
            },
            height: 'auto',
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'white',
            margin: '0 auto',
            aspectRatio: '1',  // Garantir que a Box tenha forma quadrada
            position: 'absolute', 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // Centraliza no meio da tela
            overflow: 'hidden',  // Impede o scroll horizontal ou vertical
        }}
    >
      {
        /*
          <Typography variant="h5" gutterBottom>
            Meu Bolso - Login
          </Typography>
        */
      }
      <img 
        src={logo} 
        alt="Logo" 
        style={{
          maxWidth: '40%', 
          maxHeight: '40%', 
          objectFit: 'contain', // Garante que a imagem fique proporcional
          marginBottom: '16px' // Espaço entre a imagem e o formulário
        }}
      />
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextField
          label="Login"
          variant="outlined"
          fullWidth
          margin="normal"
          value={loginInput}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
        <TextField
          label="Senha"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={passwordInput}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{
            marginTop: 2,
            padding: '10px',
          }}
        >
          Entrar
        </Button>
      </form>
    </Box>
  );
};

export default Login;
