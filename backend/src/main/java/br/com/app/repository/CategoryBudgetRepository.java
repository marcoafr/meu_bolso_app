package br.com.app.repository;

import br.com.app.model.CategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.app.Constants;
import java.util.List;

@Repository
public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {

    List<CategoryBudget> findByUserIdAndStatus(Long userId, Constants.Status status);
}
