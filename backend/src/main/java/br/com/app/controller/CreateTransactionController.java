package br.com.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import br.com.app.Constants;
import br.com.app.dto.CreateTransactionDTO;
import br.com.app.dto.ReceivableDTO;
import br.com.app.dto.TransactionDTO;
import br.com.app.model.Category;
import br.com.app.model.Receivable;
import br.com.app.model.Transaction;

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

    @PostMapping("/mount-transaction")
    public ResponseEntity<String> mountTransaction(@RequestBody CreateTransactionDTO transactionDTO) {
        List<Transaction> transactions = new ArrayList<>();

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
                        receivable.getStatus().getValue()
                ))
                .collect(Collectors.toList());

        return new TransactionDTO(
                transaction.getId(),
                transaction.getTotalAmount(),
                transaction.getIssueDate(),
                transaction.getStatus().getValue(),
                transaction.getCategory().getId(),
                transaction.getDescription(),
                receivableDTOs
        );
    }

    private Transaction createInstallmentTransaction(CreateTransactionDTO dto) {
        Transaction transaction = new Transaction();
        transaction.setTotalAmount(dto.getTotalAmount());
        transaction.setIssueDate(dto.getDate());
        transaction.setCategory(new Category());
        transaction.getCategory().setId(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setCorrelationId(UUID.randomUUID().toString());
        transaction.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão

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

            receivables.add(receivable);
            competenceDate = advanceToNextMonth(competenceDate);
        }

        transaction.setReceivables(receivables);
        return transaction;
    }

    private List<Transaction> createRecurringTransactions(CreateTransactionDTO dto) {
        List<Transaction> transactions = new ArrayList<>();
        LocalDate issueDate = dto.getDate();

        for (int i = 0; i < dto.getRecurrenceQuantity(); i++) {
            Transaction transaction = new Transaction();
            transaction.setTotalAmount(dto.getTotalAmount());
            transaction.setIssueDate(issueDate);
            transaction.setCategory(new Category());
            transaction.getCategory().setId(dto.getCategory());
            transaction.setDescription(dto.getDescription());
            transaction.setCorrelationId(UUID.randomUUID().toString());
            transaction.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão

            Receivable receivable = new Receivable();
            receivable.setTotalAmount(dto.getTotalAmount());
            receivable.setCompetenceDate(issueDate);
            receivable.setTransaction(transaction);
            receivable.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão

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
        transaction.setDescription(dto.getDescription());
        transaction.setCorrelationId(UUID.randomUUID().toString());
        transaction.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão

        Receivable receivable = new Receivable();
        receivable.setTotalAmount(dto.getTotalAmount());
        receivable.setCompetenceDate(dto.getDate());
        receivable.setTransaction(transaction);
        receivable.setStatus(Constants.TransactionStatus.PENDING); // Status inicial padrão

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
