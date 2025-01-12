// src/components/Transactions.tsx

import { Typography, Container, Box, Button, Grid } from "@mui/material";
import { useState } from "react";
import DateFilter from "../directives/DateDirective";
import TransactionTypeFilter from "../directives/TransactionTypeDirective";
import CategoryDirective from "../directives/CategoryDirective";
import CardDirective from "../directives/CardDirective";
import BankDirective from "../directives/BankDirective";
import PaymentStatusDirective from "../directives/PaymentStatusDirective";
import { receivableService } from "../api/receivableService";

const Transactions = () => {
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Subtrai 1 dia para obter o dia de ontem
  
    const formatDate = (date: Date) => date.toISOString().split('T')[0]; // Função para formatar a data
  
    return {
      from: formatDate(yesterday), // Data de ontem
      to: formatDate(today), // Data de hoje
      transactionType: null as number | null,
      categories: [] as number[],
      bankAccounts: [] as number[],
      creditCards: [] as number[],
      status: [] as number[],
    };
  });

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: Array.isArray(value) ? [...value] : value, // Suporte a múltiplos ou únicos
    }));
  };

  const handleSearch = () => {
    console.log('Aplicar pesquisa com filtros:', filters);
    receivableService
      .getAnalyticalListReceivableByUserId(filters)
      .then((data) => {
        console.log(data);
      })
      .catch(() => {

      })
      .finally(() => {

      });
    // Lógica de pesquisa será implementada aqui
  };

  return (
    <Container>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Transações
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DateFilter
              onChange={(dates) => {
                handleFilterChange("from", dates.from);
                handleFilterChange("to", dates.to);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TransactionTypeFilter
              value={filters.transactionType!}
              onChange={(value) => handleFilterChange("transactionType", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CategoryDirective
              value={filters.categories}
              multiple
              onChange={(value) => handleFilterChange("categories", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BankDirective
              value={filters.bankAccounts}
              multiple
              onChange={(value) => handleFilterChange("bankAccounts", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardDirective
              value={filters.creditCards}
              multiple
              onChange={(value) => handleFilterChange("creditCards", value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <PaymentStatusDirective
              value={filters.status}
              multiple
              onChange={(value) => handleFilterChange("status", value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Pesquisar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Transactions;
