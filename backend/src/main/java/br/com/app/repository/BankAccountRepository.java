package br.com.app.repository;

import br.com.app.Constants;
import br.com.app.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    List<BankAccount> findByUserIdAndStatus(Long userId, Constants.Status status);
}
