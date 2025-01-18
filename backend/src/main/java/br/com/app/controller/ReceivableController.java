package br.com.app.controller;

import br.com.app.Constants;
import br.com.app.dto.CategoryDTO;
import br.com.app.dto.CreditCardDTO;
import br.com.app.dto.LiquidationRequestDTO;
import br.com.app.dto.ReceivableByCategoryDTO;
import br.com.app.dto.ReceivableDTO;
import br.com.app.dto.ReceivableFilterDTO;
import br.com.app.dto.ReceivablesRequest;
import br.com.app.dto.TransactionDTO;
import br.com.app.dto.UpdateReceivableDTO;
import br.com.app.exception.ResourceNotFoundException;
import br.com.app.model.BankAccount;
import br.com.app.model.Category;
import br.com.app.model.Receivable;
import br.com.app.model.Transaction;
import br.com.app.repository.ReceivableRepository;
import br.com.app.repository.TransactionRepository;
import br.com.app.service.ReceivableService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receivables")
public class ReceivableController {

    @Autowired
    private ReceivableRepository receivableRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;

    private final ReceivableService receivableService;

    public ReceivableController(ReceivableService receivableService) {
        this.receivableService = receivableService;
    }

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
                        receivable.getCompetenceDate(),
                        receivable.getStatus().getValue(),
                        (receivable.getBankAccount() != null && receivable.getBankAccount().getId() != null && receivable.getBankAccount().getId() > 0) ?receivable.getBankAccount().getId() : null,
                        (receivable.getBankAccount() != null && receivable.getBankAccount().getName() != null && !receivable.getBankAccount().getName().isEmpty()) ? receivable.getBankAccount().getName() : null,
                        transactionDTO,
                        receivable.getMetadata()
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
            receivable.getCardCompetenceDate(),
            receivable.getStatus().getValue(),
            receivable.getBankAccount().getId(),
            receivable.getBankAccount().getName(),
            null,
            receivable.getMetadata()
        );
    }   
    
    @PostMapping("/updateReceivable")
    public ReceivableDTO updateReceivable(@RequestBody UpdateReceivableDTO updateReceivableDTO) {
        // Buscar o receivable a ser alterado
        Receivable receivable = receivableRepository.findById(updateReceivableDTO.getReceivableId())
            .orElseThrow(() -> new ResourceNotFoundException("Receivable not found"));

        // Atualizar as propriedades do receivable
        Category newCategory = new Category();  // Recuperar ou instanciar a nova categoria
        newCategory.setId(updateReceivableDTO.getCategoryId());
        receivable.getTransaction().setCategory(newCategory);
        receivable.getTransaction().getCategory().setId(updateReceivableDTO.getCategoryId());

        // Verificar se houve alteração no valor
        BigDecimal oldAmount = receivable.getTotalAmount();  // O valor antigo do receivable
        BigDecimal newAmount = updateReceivableDTO.getAmount();

        // Se o valor foi alterado, ajustar a transaction associada
        if (!oldAmount.equals(newAmount)) {
            // Atualizar a Transaction associada
            Transaction transaction = receivable.getTransaction();
            BigDecimal transactionAmountDifference = newAmount.subtract(oldAmount);
            
            // Atualizar o valor da transação
            transaction.setTotalAmount(transaction.getTotalAmount().add(transactionAmountDifference));
            transactionRepository.save(transaction);
        }

        // Atualizar o valor e a data de competência do receivable
        receivable.setTotalAmount(newAmount);
        receivable.setCompetenceDate(updateReceivableDTO.getCompetenceDate());

        // Salvar as alterações no receivable
        receivableRepository.save(receivable);

        // Retornar o DTO atualizado do receivable
        return new ReceivableDTO(
            receivable.getId(),
            receivable.getTotalAmount(),
            receivable.getCompetenceDate(),
            receivable.getCardCompetenceDate(),
            receivable.getStatus().getValue(),
            receivable.getBankAccount() != null ? receivable.getBankAccount().getId() : null,
            receivable.getBankAccount() != null ? receivable.getBankAccount().getName() : null,
            null,
            receivable.getMetadata()
        );
    }

    @PostMapping("/cancelReceivable")
    public ResponseEntity<String> cancelReceivable(@RequestBody Long receivableId) {
        // Buscar o receivable a ser cancelado
        Receivable receivable = receivableRepository.findById(receivableId)
            .orElseThrow(() -> new ResourceNotFoundException("Receivable not found"));

        // Verificar se o receivable está em estado pendente
        if (receivable.getStatus() != Constants.TransactionStatus.PENDING) {
            throw new IllegalStateException("Receivable is not in a cancelable state.");
        }

        // Buscar os outros receivables associados à mesma transação
        List<Receivable> relatedReceivables = receivableRepository.findByTransactionId(receivable.getTransaction().getId());

        // Verificar se algum outro receivable já foi pago
        boolean hasPaidReceivable = relatedReceivables.stream()
            .anyMatch(r -> r.getStatus() == Constants.TransactionStatus.PAID);

        if (hasPaidReceivable) {
            throw new IllegalStateException("Cannot cancel the receivable because another related receivable is already paid.");
        }

        // Cancelar todos os receivables pendentes
        for (Receivable relatedReceivable : relatedReceivables) {
            if (relatedReceivable.getStatus() == Constants.TransactionStatus.PENDING) {
                relatedReceivable.setStatus(Constants.TransactionStatus.CANCELED);
                receivableRepository.save(relatedReceivable);
            }
        }

        // Cancelar o receivable atual
        receivable.setStatus(Constants.TransactionStatus.CANCELED);
        receivableRepository.save(receivable);

        // Retornar resposta positiva com status HTTP 200 OK
        return ResponseEntity.ok("Transação cancelada com sucesso!");
    }

    @PostMapping("/deleteReceivable")
    public ResponseEntity<String> deleteReceivable(@RequestBody Long receivableId) {
        // Buscar o receivable a ser deletado
        Receivable receivable = receivableRepository.findById(receivableId)
            .orElseThrow(() -> new ResourceNotFoundException("Receivable not found"));

        // Verificar se o status do receivable é CANCELED ou PAID
        if (receivable.getStatus() != Constants.TransactionStatus.CANCELED &&
            receivable.getStatus() != Constants.TransactionStatus.PAID) {
            throw new IllegalStateException("Receivable is not in a deletable state.");
        }

        // Buscar os outros receivables associados à mesma transação
        List<Receivable> relatedReceivables = receivableRepository.findByTransactionId(receivable.getTransaction().getId());

        // Verificar se todos os receivables estão em estado CANCELED ou PAID
        for (Receivable relatedReceivable : relatedReceivables) {
            if (relatedReceivable.getStatus() != Constants.TransactionStatus.CANCELED &&
                relatedReceivable.getStatus() != Constants.TransactionStatus.PAID) {
                throw new IllegalStateException("Cannot delete because there are receivables in an invalid state.");
            }
        }

        // Alterar o status de todos os receivables relacionados para DELETED
        for (Receivable relatedReceivable : relatedReceivables) {
            relatedReceivable.setStatus(Constants.TransactionStatus.DELETED);
            receivableRepository.save(relatedReceivable);
        }

        // Retornar resposta positiva com status HTTP 200 OK
        return ResponseEntity.ok("Transação deletada com sucesso!");
    }

    @PostMapping("/receivablesByMonth")
    public List<ReceivableByCategoryDTO> getReceivablesByMonth(@RequestBody ReceivableFilterDTO filter) {
        return receivableService.getReceivablesByMonth(filter);
    }
}
