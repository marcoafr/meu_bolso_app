package br.com.app.repository;

import br.com.app.Constants;
import br.com.app.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserIdAndStatus(Long userId, Constants.Status status);
}