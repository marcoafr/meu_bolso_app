import {
  Modal,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatCurrency, formatLocalDate } from '../util/Util';
import { transactionService } from '../api/transactionService';
import { useSnackbar } from '../directives/snackbar/SnackbarContext';
import { useAuth } from '../authenticationContext';

const TransactionsReceivablesModal = ({ openCategoryModal, setOpenCategoryModal, transactions, title }) => {
  const { user } = useAuth(); // Pegando o user do contexto de autenticação
  const { showSnackbar } = useSnackbar(); // Usando o hook do Snackbar
    
  const handleClose = () => {
      setOpenCategoryModal(false);
  };
  
  const handleSave = () => {
    // Função de salvar que você vai implementar
    transactions.forEach(t => {
        t.issueDate = formatLocalDate(t.issueDate)
        t.userId = user?.id
        t.receivables.forEach(r => {
            r.competenceDate = formatLocalDate(r.competenceDate);
            r.cardCompetenceDate = formatLocalDate(r.cardCompetenceDate);
            if (r.paymentDate != null) {
                r.paymentDate = formatLocalDate(r.paymentDate);
            }
        })
    })
    transactionService
        .batchInsert(transactions)
        .then((data) => {
            showSnackbar("Inclusão bem-sucedida!", "success"); 
            setOpenCategoryModal(false);
          })
          .catch(() => {
            showSnackbar("Inclusão mal-sucedida!", "error"); 
          });
  };

  return (
    <Modal
      open={openCategoryModal}
      onClose={() => setOpenCategoryModal(false)}
    >
      <Box p={3} bgcolor="white" borderRadius={2} mx="auto" my={5} width={400} maxWidth="80%" 
        sx={{
            maxHeight: '80vh', // Define a altura máxima em relação à altura da viewport
            overflowY: 'auto', // Permite scroll vertical quando o conteúdo ultrapassa o limite
            display: 'flex',
            flexDirection: 'column',
        }}
      >
        <Typography variant="h6" mb={2}>
          { title }
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {transactions.map((transaction, index) => (
                <Accordion key={index} defaultExpanded sx={{bgcolor: 'grey.300'}}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box>
                            {  
                                transactions.length == 1 ? (
                                    <Typography>{transaction.type === 'despesa' ? 'Despesa' : 'Receita'} Única</Typography>
                                ) : (
                                    <Typography>{transaction.type === 'despesa' ? 'Despesa' : 'Receita'} {index + 1}</Typography>
                                )
                            }
                            { 
                                transaction.creditCardName != null && transaction.creditCardName != '' && (
                                    <Typography fontSize={14} mt={1}> {/* mt={1} adiciona um pequeno espaçamento superior */}
                                        Cartão: {transaction.creditCardName}
                                    </Typography>
                                )
                            }
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{mt: -3}}>
                        <List>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                    primary="Categoria"
                                    secondary={transaction.categoryName}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                    primary="Data de Emissão"
                                    secondary={
                                        `${String(transaction.issueDate.day).padStart(2, '0')}/${String(transaction.issueDate.month).padStart(2, '0')}/${transaction.issueDate.year}`
                                    }
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                    primary="Status"
                                    secondary={
                                        transaction.status === 0
                                        ? 'Pendente'
                                        : transaction.status === 1
                                        ? 'Pago'
                                        : transaction.status === 2
                                        ? 'Parcialmente Pago'
                                        : transaction.status === 3
                                        ? 'Cancelado'
                                        : transaction.status === 4
                                        ? 'Deletado'
                                        : 'N/A'
                                    }
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                    primary="Valor Total"
                                    secondary={
                                        `${formatCurrency(transaction.totalAmount)}`
                                    }
                                />
                            </ListItem>
                        </List>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="subtitle1">Parcelas:</Typography>

                    {transaction.receivables.map((receivable, rIndex) => (
                        <Accordion key={rIndex} sx={{bgcolor: 'grey.100'}}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box>
                                {  
                                    transaction.receivables.length == 1 ? (
                                        <Typography>Parcela Única</Typography>
                                    ) : (
                                        <Typography>Parcela {rIndex + 1}</Typography>
                                    )
                                }
                                { 
                                    receivable.bankName != null && receivable.bankName != '' && (
                                        <Typography fontSize={14} mt={1}> {/* mt={1} adiciona um pequeno espaçamento superior */}
                                            Banco: {receivable.bankName}
                                        </Typography>
                                    )
                                }
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{mt: -3}}>
                            <List>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                primary="Valor"
                                secondary={`${formatCurrency(receivable.amount)}`}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                primary="Data de Competência"
                                secondary={
                                    `${String(receivable.competenceDate.day).padStart(2, '0')}/${String(receivable.competenceDate.month).padStart(2, '0')}/${receivable.competenceDate.year}`
                                }
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                primary="Status"
                                secondary={
                                    receivable.status === 0 ? 'Pendente' : receivable.status === 1 ? 'Pago' : receivable.status === 2 ? 'Parcialmente Pago' : receivable.status === 3 ? 'Cancelado' : receivable.status === 4 ? 'Deletado' : 'N/A'
                                }
                                />
                            </ListItem>
                            </List>
                        </AccordionDetails>
                        </Accordion>
                    ))}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>

        {/* Botões Fixos no Final do Modal */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={handleClose}>Fechar</Button>
            <Button variant="contained" color="primary" onClick={handleSave}>Salvar</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TransactionsReceivablesModal;