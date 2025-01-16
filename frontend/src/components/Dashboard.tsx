import { useEffect, useState } from "react";
import { Typography, Container, Box, Card, CardContent } from "@mui/material";
import { dashboardService } from "../api/dashboardService";
import { formatCurrency } from "../util/Util";
import { useAuth } from "../authContext";

interface BankAccountBalance {
  id: number;
  name: string;
  currentBalance: number;
}

const Dashboard = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccountBalance[]>([]);
  const { user } = useAuth(); // Pegando o user do contexto de autenticação

  useEffect(() => {
    const fetchCurrentBalance = async () => {
      try {
        const data = await dashboardService.currentBalance(user?.id);
        setBankAccounts(data);
      } catch (error) {
        console.error("Erro ao buscar os saldos atuais:", error);
      }
    };

    fetchCurrentBalance();
  }, [user]);

  return (
    <Container>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Dashboard
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Saldo Atual das Contas Bancárias
            </Typography>
            {bankAccounts.length > 0 ? (
              bankAccounts.map((account) => (
                <Typography key={account.id}>
                  {account.name}: {formatCurrency(account.currentBalance)}
                </Typography>
              ))
            ) : (
              <Typography>Nenhuma conta encontrada.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;
