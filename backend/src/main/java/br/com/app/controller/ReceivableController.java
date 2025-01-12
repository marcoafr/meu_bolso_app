package br.com.app.controller;

import br.com.app.dto.CategoryDTO;
import br.com.app.dto.ReceivableDTO;
import br.com.app.dto.ReceivablesRequest;
import br.com.app.dto.TransactionDTO;
import br.com.app.model.Category;
import br.com.app.model.Receivable;
import br.com.app.model.Transaction;
import br.com.app.repository.ReceivableRepository;
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
}
