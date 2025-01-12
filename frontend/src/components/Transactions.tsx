// src/components/Transactions.tsx

import { Typography, Container, Box, Button, Grid } from "@mui/material";
import { useState } from "react";
import DateFilter from "../directives/DateDirective";
import TransactionTypeFilter from "../directives/TransactionTypeDirective";
import CategoryDirective from "../directives/CategoryDirective";
import CardDirective from "../directives/CardDirective";
import BankDirective from "../directives/BankDirective";
import PaymentStatusDirective from "../directives/PaymentStatusDirective";

const Transactions = () => {
  const [filters, setFilters] = useState({
    from: null as string | null,
    to: null as string | null,
    transactionType: null as number | null,
    categories: [] as number[],  // Aceita múltiplos ou um único valor
    bankAccounts: [] as number[],  // Aceita múltiplos ou um único valor
    creditCards: [] as number[],  // Aceita múltiplos ou um único valor
    status: [] as number[],  // Status agora é um array para permitir múltiplos
  });

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: Array.isArray(value) ? [...value] : value, // Suporte a múltiplos ou únicos
    }));
  };

  const handleSearch = () => {
    console.log('Aplicar pesquisa com filtros:', filters);
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
