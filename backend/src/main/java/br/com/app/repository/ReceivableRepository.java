package br.com.app.repository;

import br.com.app.Constants;
import br.com.app.dto.ReceivableByCategoryDTO;
import br.com.app.model.CreditCard;
import br.com.app.model.Receivable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReceivableRepository extends JpaRepository<Receivable, Long>, ReceivableRepositoryCustom {

    @Query("SELECT r FROM Receivable r " +
           "JOIN FETCH r.transaction t " +
           "WHERE r.user.id = :userId")
    List<Receivable> findByUserId(Long userId);

    List<Receivable> findByTransactionId(Long transactionId);

    List<Receivable> findByBankAccountIdAndStatus(Long bankAccountId, Constants.TransactionStatus status);

    List<Receivable> findByBankAccountIdAndStatusAndPaymentDateLessThanEqual(Long bankAccountId, Constants.TransactionStatus status, LocalDate paymentDate);

    @Query("SELECT r FROM Receivable r JOIN r.transaction t JOIN r.user u JOIN t.creditCard c JOIN t.category cat WHERE r.cardCompetenceDate BETWEEN :startDate AND :endDate AND u.id = :userId AND c.id = :creditCardId")
    List<Receivable> findByCardCompetenceDateBetweenAndCreditCardAndUserId(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate, 
            @Param("userId") Long userId,
            @Param("creditCardId") Long creditCardId
    );

    /*
    @Query("SELECT new br.com.app.dto.ReceivableByCategoryDTO(c.id, c.name, c.type, COALESCE(SUM(r.totalAmount), 0), COALESCE(SUM(cb.amount), 0)) FROM Receivable r JOIN r.transaction t JOIN t.category c LEFT JOIN CategoryBudget cb ON cb.category.id = c.id AND cb.user.id = :userId WHERE r.competenceDate BETWEEN :startDate AND :endDate GROUP BY c.id, c.name, c.type")
    */
    @Query("SELECT new br.com.app.dto.ReceivableByCategoryDTO(c.id, c.name, c.type, COALESCE(SUM(r.totalAmount), 0), COALESCE(SUM(r.paidAmount), 0), COALESCE(cb.amount, 0)) FROM Receivable r JOIN r.transaction t JOIN t.category c LEFT JOIN CategoryBudget cb ON cb.category.id = c.id AND cb.user.id = :userId WHERE r.competenceDate BETWEEN :startDate AND :endDate AND r.user.id = :userId AND r.status IN (0, 1) GROUP BY c.id, c.name, c.type, cb.amount")
    List<ReceivableByCategoryDTO> findReceivablesByMonthAndUser(@Param("startDate") LocalDate startDate,
                                                                @Param("endDate") LocalDate endDate,
                                                                @Param("userId") Long userId
    );
}
