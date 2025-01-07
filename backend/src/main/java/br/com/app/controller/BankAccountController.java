package br.com.app.controller;

import br.com.app.dto.BankAccountDTO;
import br.com.app.repository.BankAccountRepository;
import br.com.app.model.BankAccount;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bank-accounts")
public class BankAccountController {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    // Endpoint de pesquisa de contas bancárias por userId
    @PostMapping("/search")
    public List<BankAccountDTO> findByUserId(@RequestBody Long userId) {
        List<BankAccount> bankAccounts = bankAccountRepository.findByUserId(userId);

        // Convertendo de BankAccount para BankAccountDTO
        return bankAccounts.stream()
                .map(bankAccount -> new BankAccountDTO(
                        bankAccount.getId(),
                        bankAccount.getName(),
                        bankAccount.getColor(),
                        bankAccount.getInitialAmount(),
                        bankAccount.getStatus()))
                .collect(Collectors.toList());
    }
}
