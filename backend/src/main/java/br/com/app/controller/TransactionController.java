package br.com.app.controller;

import br.com.app.dto.TransactionDTO;
import br.com.app.Constants;
import br.com.app.dto.ReceivableDTO;
import br.com.app.model.Transaction;
import br.com.app.model.User;
import br.com.app.model.BankAccount;
import br.com.app.model.Category;
import br.com.app.model.CreditCard;
import br.com.app.model.Receivable;
import br.com.app.repository.TransactionRepository;
import br.com.app.repository.ReceivableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @PostMapping("/batch-insert")
    @Transactional
    public ResponseEntity<String> batchInsert(@RequestBody List<TransactionDTO> transactionDTOs) {
        for (TransactionDTO dto : transactionDTOs) {
            // Cria a transação
            Transaction transaction = new Transaction();
            transaction.setUser(new User());
            transaction.getUser().setId(dto.getUserId());;
            transaction.setCategory(new Category());
            transaction.getCategory().setId(dto.getCategoryId());
            transaction.setDescription(dto.getDescription());
            transaction.setIssueDate(dto.getIssueDate());
            transaction.setStatus(Constants.TransactionStatus.fromValue(dto.getStatus()));
            transaction.setTotalAmount(dto.getTotalAmount());

            if (dto.getCreditCardId() != null && dto.getCategoryId() > 0) {
                transaction.setCreditCard(new CreditCard());
                transaction.getCreditCard().setId(dto.getCreditCardId());
            }

            // Salva a transação no banco
            transaction = transactionRepository.save(transaction);

            // Processa os recebíveis
            for (ReceivableDTO receivableDTO : dto.getReceivables()) {
                Receivable receivable = new Receivable();
                receivable.setUser(new User());
                receivable.getUser().setId(dto.getUserId());
                receivable.setTotalAmount(receivableDTO.getAmount());
                receivable.setCompetenceDate(receivableDTO.getCompetenceDate());
                receivable.setStatus(Constants.TransactionStatus.fromValue(receivableDTO.getStatus()));
                receivable.setTransaction(transaction);
                receivable.setMetadata("{}");

                if (receivableDTO.getBankId() != null && receivableDTO.getBankId() > 0) {
                    receivable.setBankAccount(new BankAccount());
                    receivable.getBankAccount().setId(receivableDTO.getBankId());
                }

                // Salva o recebível
                receivableRepository.save(receivable);
            }
        }
        
        return ResponseEntity.ok("Batch insert successful");
    }
}
