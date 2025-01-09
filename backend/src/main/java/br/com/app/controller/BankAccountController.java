package br.com.app.controller;

import br.com.app.Constants;
import br.com.app.dto.BankAccountDTO;
import br.com.app.repository.BankAccountRepository;
import br.com.app.model.BankAccount;
import br.com.app.model.User;

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
        List<BankAccount> bankAccounts = bankAccountRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);

        // Convertendo de BankAccount para BankAccountDTO
        return bankAccounts.stream()
                .map(bankAccount -> new BankAccountDTO(
                        bankAccount.getId(),
                        null,
                        bankAccount.getName(),
                        bankAccount.getColor(),
                        bankAccount.getInitialAmount(),
                        bankAccount.getStatus().getValue()))
                .collect(Collectors.toList());
    }

    // Endpoint para adicionar uma nova conta bancária
    @PostMapping("/add")
    public BankAccountDTO addBankAccount(@RequestBody BankAccountDTO bankAccountDTO) {
        BankAccount newBankAccount = new BankAccount();
        newBankAccount.setUser(new User());
        newBankAccount.getUser().setId(bankAccountDTO.getUserId());
        newBankAccount.setName(bankAccountDTO.getName());
        newBankAccount.setColor(bankAccountDTO.getColor());
        newBankAccount.setInitialAmount(bankAccountDTO.getInitialAmount());
        newBankAccount.setStatus(Constants.Status.ACTIVE); // Definindo um status padrão

        BankAccount savedBankAccount = bankAccountRepository.save(newBankAccount);

        return new BankAccountDTO(
                savedBankAccount.getId(),
                null,
                savedBankAccount.getName(),
                savedBankAccount.getColor(),
                savedBankAccount.getInitialAmount(),
                savedBankAccount.getStatus().getValue()
        );
    }

    // Endpoint para editar uma conta bancária existente
    @PostMapping("/edit")
    public BankAccountDTO editBankAccount(@RequestBody BankAccountDTO bankAccountDTO) {
        BankAccount existingBankAccount = bankAccountRepository.findById(bankAccountDTO.getId())
                .orElseThrow(() -> new RuntimeException("Conta bancária não encontrada"));

        existingBankAccount.setName(bankAccountDTO.getName());
        existingBankAccount.setColor(bankAccountDTO.getColor());
        existingBankAccount.setInitialAmount(bankAccountDTO.getInitialAmount());
        if (bankAccountDTO.getStatus() != null) {
                existingBankAccount.setStatus(bankAccountDTO.getStatus() == 0 ? 
                        Constants.Status.ACTIVE : Constants.Status.INACTIVE
                );
        }

        BankAccount updatedBankAccount = bankAccountRepository.save(existingBankAccount);

        return new BankAccountDTO(
                updatedBankAccount.getId(),
                null,
                updatedBankAccount.getName(),
                updatedBankAccount.getColor(),
                updatedBankAccount.getInitialAmount(),
                updatedBankAccount.getStatus().getValue()
        );
    }
}
