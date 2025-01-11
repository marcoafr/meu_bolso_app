package br.com.app.service;

import br.com.app.model.BankAccount;
import br.com.app.repository.BankAccountRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;

    @Autowired
    public BankAccountService(BankAccountRepository bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }    

    /**
    * Busca um conta bancária pelo ID.
    *
    * @param bankId ID do conta bancária a ser buscada.
    * @return Conta bancária encontrada ou null se não for encontrada.
    */
    public BankAccount getBankAccountById(Long bankId) {
        Optional<BankAccount> bankAccount = bankAccountRepository.findById(bankId);
        return bankAccount.orElse(null);
    }
}
