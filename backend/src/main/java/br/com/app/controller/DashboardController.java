package br.com.app.controller;

import br.com.app.dto.BankAccountResponseDTO;
import br.com.app.model.BankAccount;
import br.com.app.model.Receivable;
import br.com.app.repository.BankAccountRepository;
import br.com.app.repository.ReceivableRepository;
import br.com.app.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @PostMapping("/currentBalance")
    public List<BankAccountResponseDTO> findCurrentBalanceByUserId(@RequestBody Long userId) {
        // Buscar todas as contas bancárias do usuário com status ACTIVE
        List<BankAccount> activeBankAccounts = bankAccountRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);

        // Para cada conta bancária, calcular o saldo atual subtraindo os valores pagos das receivables
        return activeBankAccounts.stream().map(account -> {
            // Calcular o total de receivables pagas para esta conta
            BigDecimal totalPaidReceivables = receivableRepository
                .findByBankAccountIdAndStatus(account.getId(), Constants.TransactionStatus.PAID)
                .stream()
                .map(Receivable::getPaidAmount) // Mapeia para BigDecimal
                .reduce(BigDecimal.ZERO, BigDecimal::add); // Soma os valores

            // Criar um DTO com o saldo atualizado
            return new BankAccountResponseDTO(
                    account.getId(),
                    account.getName(),
                    account.getInitialAmount().subtract(totalPaidReceivables)
            );
        }).collect(Collectors.toList());
    }
}
