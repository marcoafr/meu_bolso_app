package br.com.app.controller;

import br.com.app.Constants;
import br.com.app.dto.CategoryDTO;
import br.com.app.dto.CreditCardDTO;
import br.com.app.dto.LiquidationRequestDTO;
import br.com.app.dto.ReceivableDTO;
import br.com.app.dto.ReceivablesRequest;
import br.com.app.dto.TransactionDTO;
import br.com.app.exception.ResourceNotFoundException;
import br.com.app.model.BankAccount;
import br.com.app.model.Category;
import br.com.app.model.Receivable;
import br.com.app.model.Transaction;
import br.com.app.repository.ReceivableRepository;
import br.com.app.repository.TransactionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receivables")
public class ReceivableController {

    @Autowired
    private ReceivableRepository receivableRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;

    @PostMapping("/searchAnalytical")
    @Transactional
    public List<ReceivableDTO> searchAnalytical(@RequestBody ReceivablesRequest receivablesRequest) {
        if (!receivablesRequest.validateDateRange()) {
            throw new IllegalArgumentException("O intervalo de datas deve ser de no máximo 365 dias.");
        }

        List<Receivable> receivables = receivableRepository.searchReceivables(receivablesRequest);
        
        // Convertendo a lista de Receivable para ReceivableDTO
        List<ReceivableDTO> receivableDTOs = receivables.stream()
            .map(receivable -> {
                Transaction transaction = receivable.getTransaction();
                Category category = transaction.getCategory();

                // Criar CategoryDTO
                CategoryDTO categoryDTO = new CategoryDTO(
                        category.getId(),
                        category.getUser().getId(),
                        category.getName(),
                        category.getType().getValue(),
                        category.getStatus().getValue()
                );

                // Criar TransactionDTO
                TransactionDTO transactionDTO = new TransactionDTO(
                        transaction.getId(),
                        transaction.getTotalAmount(),
                        transaction.getIssueDate(),
                        transaction.getStatus().getValue(),
                        category.getId(),
                        category.getName(),
                        transaction.getDescription(),
                        null,
                        transaction.getUser().getId(),
                        (transaction.getCreditCard() != null && transaction.getCreditCard().getId() != null && transaction.getCreditCard().getId() > 0) ?transaction.getCreditCard().getId() : null,
                        (transaction.getCreditCard() != null && transaction.getCreditCard().getName() != null && !transaction.getCreditCard().getName().isEmpty()) ? transaction.getCreditCard().getName() : null,
                        categoryDTO
                );

                // Criar ReceivableDTO
                return new ReceivableDTO(
                        receivable.getId(),
                        receivable.getTotalAmount(),
                        receivable.getCompetenceDate(),
                        receivable.getStatus().getValue(),
                        (receivable.getBankAccount() != null && receivable.getBankAccount().getId() != null && receivable.getBankAccount().getId() > 0) ?receivable.getBankAccount().getId() : null,
                        (receivable.getBankAccount() != null && receivable.getBankAccount().getName() != null && !receivable.getBankAccount().getName().isEmpty()) ? receivable.getBankAccount().getName() : null,
                        transactionDTO
                );
            })
            .collect(Collectors.toList());

        return receivableDTOs;    
    }

    
    // Endpoint para liquidar um receivable
    @PostMapping("/liquidate")
    public ReceivableDTO liquidate(@RequestBody LiquidationRequestDTO liquidationRequest) {
        // Recuperar o receivable a ser liquidado
        Receivable receivable = receivableRepository.findById(liquidationRequest.getReceivableId())
            .orElseThrow(() -> new ResourceNotFoundException("Receivable not found"));

        // Verificar se o status do receivable é 0 (pendente)
        if (receivable.getStatus() != Constants.TransactionStatus.PENDING) {
            throw new IllegalStateException("Receivable is not in a liquidable state.");
        }
    
        // Alterar o status do receivable para 1 (liquidado)
        receivable.setStatus(Constants.TransactionStatus.PAID);
        receivable.setBankAccount(new BankAccount());
        receivable.getBankAccount().setId(liquidationRequest.getBankAccountId());
        receivable.setPaymentDate(liquidationRequest.getPaymentDate());
        receivable.setPaidAmount(receivable.getTotalAmount());
        receivableRepository.save(receivable);
    
        // Recuperar a transaction associada a este receivable
        Transaction transaction = receivable.getTransaction();
    
        // Verificar outros receivables da mesma transaction
        List<Receivable> transactionReceivables = receivableRepository.findByTransactionId(transaction.getId());
    
        // Verificar se há outros receivables com status 0 (pendente)
        boolean hasPendingReceivables = transactionReceivables.stream()
                .anyMatch(r -> r.getStatus() == Constants.TransactionStatus.PENDING && !r.getId().equals(liquidationRequest.getReceivableId()));
    
        // Atualizar o status da transaction
        if (hasPendingReceivables) {
            // Se houver outros pendentes, a transaction deve ser parcialmente paga (status 2)
            transaction.setStatus(Constants.TransactionStatus.PARTIALLY_PAID);
        } else {
            // Caso contrário, a transaction pode ser totalmente paga (status 1)
            transaction.setStatus(Constants.TransactionStatus.PAID);
        }
    
        // Salvar a transaction com o status atualizado
        transactionRepository.save(transaction);
    
        // Retornar o DTO do receivable
        return new ReceivableDTO(
            receivable.getId(),
            receivable.getTotalAmount(),
            receivable.getCompetenceDate(),
            receivable.getStatus().getValue(),
            receivable.getBankAccount().getId(),
            receivable.getBankAccount().getName(),
            null
        );
    }    
}
