package br.com.app.repository;

import br.com.app.Constants;
import br.com.app.model.Receivable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface ReceivableRepository extends JpaRepository<Receivable, Long>, ReceivableRepositoryCustom {

    @Query("SELECT r FROM Receivable r " +
           "JOIN FETCH r.transaction t " +
           "WHERE r.user.id = :userId")
    List<Receivable> findByUserId(Long userId);

    List<Receivable> findByTransactionId(Long transactionId);

    List<Receivable> findByBankAccountIdAndStatus(Long bankAccountId, Constants.TransactionStatus status);
}
