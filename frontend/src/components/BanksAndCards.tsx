import { useEffect, useState } from 'react';
import { Typography, Container, Box, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../authContext'; 
import { bankAccountService } from '../api/bankAccountService';
import { formatCurrency } from '../util/Util';

const BanksAndCards = () => {
  const { user } = useAuth();  // Pegando o user do contexto de autenticação
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);  // Estado para armazenar as contas bancárias
  const [loading, setLoading] = useState<boolean>(false);  // Estado de carregamento
  const [error, setError] = useState<string | null>(null);  // Estado de erro

  useEffect(() => {
    if (!user || !user.id) return;  // Se o user não estiver disponível, não faz a requisição

    setLoading(true);  // Começa o carregamento
    bankAccountService.getBankAccountsByUserId(user.id)  // Chama o serviço que faz a requisição
      .then((data) => {
        setBankAccounts(data);  // Armazena as contas bancárias na resposta
        setLoading(false);  // Termina o carregamento
      })
      .catch((err) => {
        setError('Erro ao carregar contas bancárias');  // Caso ocorra erro
        setLoading(false);  // Termina o carregamento
      });
  }, [user]);  // Faz a requisição sempre que o user mudar

  return (
    <Container>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Bancos
        </Typography>
        
        {loading && <CircularProgress />}  {/* Exibe o loading enquanto carrega */}
        {error && <Alert severity="error">{error}</Alert>}  {/* Exibe um alerta de erro */}

        {!loading && !error && (
          <List>
            {bankAccounts.map((account) => (
              <ListItem
                key={account.id}
                sx={{
                  backgroundColor: account.color || '#f4f4f4',  // Cor de fundo (Hexadecimal)
                  borderRadius: '8px',  // Bordas arredondadas
                  marginBottom: '10px',  // Espaçamento entre os itens
                  padding: '10px',  // Espaçamento interno
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',  // Sombra suave
                  display: 'flex',
                  flexDirection: 'column',  // Exibe o conteúdo em coluna
                  transition: 'background-color 0.3s ease',  // Animação suave na cor de fundo
                  '&:hover': {
                    backgroundColor: account.color ? `${account.color}80` : '#f0f0f0',  // Cor ao passar o mouse
                  }
                }}
              >
                <ListItemText
                  primary={`Banco: ${account.name}`}  // Nome do banco
                  secondary={`Status: ${account.status === 0 ? 'Ativo' : 'Inativo'}`}  // Status da conta
                  sx={{
                    backgroundColor: '#ffffff',  // Cor de fundo branco para o texto
                    borderRadius: '4px',  // Bordas arredondadas no fundo branco
                    padding: '5px',  // Espaçamento interno para o fundo branco
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',  // Sombra suave para o fundo branco
                  }}
                />
                <ListItemText
                  primary={`Valor Inicial: ${formatCurrency(account.initialAmount)}`}  // Valor inicial formatado
                  sx={{
                    fontWeight: 'bold',  // Estilo em negrito
                    backgroundColor: '#ffffff',  // Cor de fundo branco para o texto
                    borderRadius: '4px',  // Bordas arredondadas no fundo branco
                    padding: '5px',  // Espaçamento interno para o fundo branco
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',  // Sombra suave para o fundo branco
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Cartões
        </Typography>

      </Box>
    </Container>
  );
};

export default BanksAndCards;
