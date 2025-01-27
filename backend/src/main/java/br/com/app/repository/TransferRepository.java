package br.com.app.repository;

import br.com.app.Constants;
import br.com.app.model.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByBankAccountToId(Long bankAccountToId);
    List<Transfer> findByBankAccountFromId(Long bankAccountFromId);
}
