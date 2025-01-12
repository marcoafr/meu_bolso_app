package br.com.app.repository;

import br.com.app.dto.ReceivablesRequest;
import br.com.app.model.Receivable;
import br.com.app.model.Transaction;
import br.com.app.model.BankAccount;
import br.com.app.model.Category;
import br.com.app.model.CreditCard;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import java.util.List;

@Repository
public class ReceivableRepositoryCustomImpl implements ReceivableRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Receivable> searchReceivables(ReceivablesRequest request) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Receivable> cq = cb.createQuery(Receivable.class);
        Root<Receivable> receivable = cq.from(Receivable.class);
        Join<Receivable, Transaction> transaction = receivable.join("transaction", JoinType.INNER); // Relacionamento com Transaction
        Join<Receivable, BankAccount> bankAccount = receivable.join("bankAccount", JoinType.LEFT); // Relacionamento com BankAccount (LEFT JOIN)
        Join<Transaction, Category> category = transaction.join("category", JoinType.INNER); // Relacionamento com Category
        Join<Transaction, CreditCard> creditCard = transaction.join("creditCard", JoinType.LEFT); // Relacionamento com CreditCard

        Predicate[] predicates = buildPredicates(request, cb, receivable, transaction, category, creditCard, bankAccount);
        cq.where(predicates);

        return entityManager.createQuery(cq).getResultList();
    }

    private Predicate[] buildPredicates(ReceivablesRequest request, CriteriaBuilder cb, Root<Receivable> receivable, Join<Receivable, Transaction> transaction, Join<Transaction, Category> category, Join<Transaction, CreditCard> creditCard, Join<Receivable, BankAccount> bankAccount) {
        Predicate[] predicates = new Predicate[13]; // Ajuste o tamanho conforme necessário

        int index = 0;

        // Filtrando por bankAccounts (relacionado com receivables)
        if (request.getBankAccounts() != null && !request.getBankAccounts().isEmpty()) {
            predicates[index++] = receivable.get("bankAccountId").in(request.getBankAccounts());
        }

        // Filtrando por categories (relacionado com transactions)
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            predicates[index++] = transaction.get("categoryId").in(request.getCategories());
        }

        // Filtrando por creditCards (relacionado com transactions)
        if (request.getCreditCards() != null && !request.getCreditCards().isEmpty()) {
            predicates[index++] = transaction.get("creditCardId").in(request.getCreditCards());
        }

        // Filtrando por from e to (relacionado com competenceDate de receivable)
        if (request.getFrom() != null) {
            predicates[index++] = cb.greaterThanOrEqualTo(receivable.get("competenceDate"), request.getFrom());
        }
        if (request.getTo() != null) {
            predicates[index++] = cb.lessThanOrEqualTo(receivable.get("competenceDate"), request.getTo());
        }

        // Filtrando por status (relacionado com receivables)
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            predicates[index++] = receivable.get("status").in(request.getStatus());
        }

        // Filtrando por transactionType (relacionado com category)
        if (request.getTransactionType() != null) {
            predicates[index++] = cb.equal(category.get("type"), request.getTransactionType());
        }

        // Removendo nulls do array de predicates
        Predicate[] result = new Predicate[index];
        System.arraycopy(predicates, 0, result, 0, index);
        
        return result;
    }
}
