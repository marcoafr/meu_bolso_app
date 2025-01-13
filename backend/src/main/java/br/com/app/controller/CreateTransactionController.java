package br.com.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import br.com.app.Constants;
import br.com.app.dto.CreateTransactionDTO;
import br.com.app.dto.ReceivableDTO;
import br.com.app.dto.TransactionDTO;
import br.com.app.model.BankAccount;
import br.com.app.model.Category;
import br.com.app.model.CreditCard;
import br.com.app.model.Receivable;
import br.com.app.model.Transaction;
import br.com.app.service.BankAccountService;
import br.com.app.service.CategoryService;
import br.com.app.service.CreditCardService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/create-transaction")
public class CreateTransactionController {

    private final CategoryService categoryService;
    private final CreditCardService creditCardService;
    private final BankAccountService bankAccountService;

    @Autowired
    public CreateTransactionController(CategoryService categoryService, CreditCardService creditCardService, BankAccountService bankAccountService) {
        this.categoryService = categoryService;
        this.creditCardService = creditCardService;
        this.bankAccountService = bankAccountService;
    }

    @PostMapping("/mount-transaction")
    public ResponseEntity<String> mountTransaction(@RequestBody CreateTransactionDTO transactionDTO) {
        List<Transaction> transactions = new ArrayList<>();

        // Get Category Info
        Category category = categoryService.getCategoryById(transactionDTO.getCategory());
        if (category == null) {
            return ResponseEntity.badRequest().body("Categoria não encontrada");
        } else {
            transactionDTO.setCategoryName(category.getName());
        }

        // Get Credit Card or Bank Info
        if (transactionDTO.getPaymentMethod().equals("cartao")) {
            // Get Credit Card Info
            CreditCard creditCard = creditCardService.getCreditCardById(transactionDTO.getCard());
            if (creditCard == null) {
                return ResponseEntity.badRequest().body("Cartão não encontrado");
            } else {
                transactionDTO.setCardName(creditCard.getName());
            }
        } else if (transactionDTO.getPaymentMethod().equals("banco")) {
            // Get Bank Info
            BankAccount bankAccount = bankAccountService.getBankAccountById(transactionDTO.getBank());
            if (bankAccount == null) {
                return ResponseEntity.badRequest().body("Conta bancária não encontrada");
            } else {
                transactionDTO.setBankName(bankAccount.getName());
            }
        }

        if ("installments".equalsIgnoreCase(transactionDTO.getPaymentType())) {
            transactions.add(createInstallmentTransaction(transactionDTO));
        } else if ("recurring".equalsIgnoreCase(transactionDTO.getPaymentType())) {
            transactions.addAll(createRecurringTransactions(transactionDTO));
        } else if ("unique".equalsIgnoreCase(transactionDTO.getPaymentType())) {
            transactions.add(createUniqueTransaction(transactionDTO));
        }

        // Convertendo as entidades Transaction para DTOs
        List<TransactionDTO> transactionDTOs = transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // Converter para JSON usando GSON
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        String jsonResponse = gson.toJson(transactionDTOs);

        return ResponseEntity.ok(jsonResponse);
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        List<ReceivableDTO> receivableDTOs = transaction.getReceivables().stream()
                .map(receivable -> new ReceivableDTO(
                        receivable.getId(),
                        receivable.getTotalAmount(),
                        receivable.getCompetenceDate(),
                        receivable.getStatus().getValue(),
                        (receivable.getBankAccount() != null && receivable.getBankAccount().getId() != null && receivable.getBankAccount().getId() > 0) 
                            ? receivable.getBankAccount().getId() 
                            : null,
                        (receivable.getBankAccount() != null && receivable.getBankAccount().getName() != null && !receivable.getBankAccount().getName().isEmpty()) 
                            ? receivable.getBankAccount().getName() 
                            : null,
                        null,
                        receivable.getMetadata()
                ))
                .collect(Collectors.toList());

        return new TransactionDTO(
                transaction.getId(),
                transaction.getTotalAmount(),
                transaction.getIssueDate(),
                transaction.getStatus().getValue(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getDescription(),
                receivableDTOs,
                null,
                (transaction.getCreditCard() != null && transaction.getCreditCard().getId() != null && transaction.getCreditCard().getId() > 0) 
                    ? transaction.getCreditCard().getId() 
                    : null,
                (transaction.getCreditCard() != null && transaction.getCreditCard().getName() != null && !transaction.getCreditCard().getName().isEmpty()) 
                    ? transaction.getCreditCard().getName() 
                    : null,
                null
        );
    }

    private Transaction createInstallmentTransaction(CreateTransactionDTO dto) {
        Transaction transaction = new Transaction();
        transaction.setTotalAmount(dto.getTotalAmount());
        transaction.setIssueDate(dto.getDate());
        transaction.setCategory(new Category());
        transaction.getCategory().setId(dto.getCategory());
        transaction.getCategory().setName(dto.getCategoryName());
        transaction.setDescription(dto.getDescription());
        transaction.setCorrelationId(UUID.randomUUID().toString());
        transaction.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão
        
        if (dto.getCard() != null && dto.getCard() > 0) {
            transaction.setCreditCard(new CreditCard());
            transaction.getCreditCard().setId(dto.getCard());
            transaction.getCreditCard().setName(dto.getCardName());
        }

        List<Receivable> receivables = new ArrayList<>();
        BigDecimal installmentValue = dto.getTotalAmount().divide(BigDecimal.valueOf(dto.getInstallments()), 2, RoundingMode.DOWN);
        BigDecimal remainder = dto.getTotalAmount().subtract(installmentValue.multiply(BigDecimal.valueOf(dto.getInstallments())));

        LocalDate competenceDate = dto.getDate();

        for (int i = 0; i < dto.getInstallments(); i++) {
            Receivable receivable = new Receivable();
            receivable.setTotalAmount(installmentValue.add(i == dto.getInstallments() - 1 ? remainder : BigDecimal.ZERO));
            receivable.setCompetenceDate(competenceDate);
            receivable.setTransaction(transaction);
            receivable.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão
            
            // Construir o JSON para o campo metadata
            String metadata = String.format("{\"installment\": \"%d\", \"total_installments\": \"%d\"}", 
                i + 1, dto.getInstallments());

            // Definir o campo metadata
            receivable.setMetadata(metadata);

            if (dto.getBank() != null && dto.getBank() > 0) {
                receivable.setBankAccount(new BankAccount());
                receivable.getBankAccount().setId(dto.getBank());
                receivable.getBankAccount().setName(dto.getBankName());
            }

            receivables.add(receivable);
            competenceDate = advanceToNextMonth(competenceDate);
        }

        transaction.setReceivables(receivables);
        return transaction;
    }

    private List<Transaction> createRecurringTransactions(CreateTransactionDTO dto) {
        List<Transaction> transactions = new ArrayList<>();
        LocalDate issueDate = dto.getDate();
        String correlationId = UUID.randomUUID().toString();

        for (int i = 0; i < dto.getRecurrenceQuantity(); i++) {
            Transaction transaction = new Transaction();
            transaction.setTotalAmount(dto.getTotalAmount());
            transaction.setIssueDate(issueDate);
            transaction.setCategory(new Category());
            transaction.getCategory().setId(dto.getCategory());
            transaction.getCategory().setName(dto.getCategoryName());
            transaction.setDescription(dto.getDescription());
            transaction.setCorrelationId(correlationId);
            transaction.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão

            if (dto.getCard() != null && dto.getCard() > 0) {
                transaction.setCreditCard(new CreditCard());
                transaction.getCreditCard().setId(dto.getCard());
                transaction.getCreditCard().setName(dto.getCardName());
            }

            Receivable receivable = new Receivable();
            receivable.setTotalAmount(dto.getTotalAmount());
            receivable.setCompetenceDate(issueDate);
            receivable.setTransaction(transaction);
            receivable.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão
            receivable.setMetadata("{}");

            if (dto.getBank() != null && dto.getBank() > 0) {
                receivable.setBankAccount(new BankAccount());
                receivable.getBankAccount().setId(dto.getBank());
                receivable.getBankAccount().setName(dto.getBankName());
            }

            transaction.setReceivables(List.of(receivable));
            transactions.add(transaction);

            issueDate = advanceRecurrence(issueDate, dto.getRecurrenceInterval());
        }

        return transactions;
    }

    private Transaction createUniqueTransaction(CreateTransactionDTO dto) {
        Transaction transaction = new Transaction();
        transaction.setTotalAmount(dto.getTotalAmount());
        transaction.setIssueDate(dto.getDate());
        transaction.setCategory(new Category());
        transaction.getCategory().setId(dto.getCategory());
        transaction.getCategory().setName(dto.getCategoryName());
        transaction.setDescription(dto.getDescription());
        transaction.setCorrelationId(UUID.randomUUID().toString());
        transaction.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão
        
        if (dto.getCard() != null && dto.getCard() > 0) {
            transaction.setCreditCard(new CreditCard());
            transaction.getCreditCard().setId(dto.getCard());
            transaction.getCreditCard().setName(dto.getCardName());
        }

        Receivable receivable = new Receivable();
        receivable.setTotalAmount(dto.getTotalAmount());
        receivable.setCompetenceDate(dto.getDate());
        receivable.setTransaction(transaction);
        receivable.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão
        receivable.setMetadata("{}");

        if (dto.getBank() != null && dto.getBank() > 0) {
            receivable.setBankAccount(new BankAccount());
            receivable.getBankAccount().setId(dto.getBank());
            receivable.getBankAccount().setName(dto.getBankName());
        }
        
        transaction.setReceivables(List.of(receivable));
        return transaction;
    }

    private LocalDate advanceToNextMonth(LocalDate date) {
        LocalDate nextMonth = date.plusMonths(1);
        int dayOfMonth = date.getDayOfMonth();
        int lastDayOfNextMonth = nextMonth.lengthOfMonth();

        return nextMonth.withDayOfMonth(Math.min(dayOfMonth, lastDayOfNextMonth));
    }

    private LocalDate advanceRecurrence(LocalDate date, String interval) {
        switch (interval.toLowerCase()) {
            case "diario":
                return date.plusDays(1);
            case "semanal":
                return date.plusWeeks(1);
            case "quinzenal":
                return date.plusWeeks(2);
            case "mensal":
                return advanceToNextMonth(date);
            case "anual":
                return date.plusYears(1);
            default:
                throw new IllegalArgumentException("Invalid recurrence interval: " + interval);
        }
    }
}
