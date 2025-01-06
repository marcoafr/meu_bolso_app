package br.com.app.repository;

import br.com.app.Constants;
import br.com.app.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Encontrar todas as categorias de um usuário com um status específico
    List<Category> findByUserIdAndStatus(Long userId, Constants.Status status);

    // Encontrar uma categoria pelo nome e tipo
    Optional<Category> findByNameAndType(String name, Constants.CategoryType type);

    // Encontrar categorias por tipo
    List<Category> findByType(Constants.CategoryType type);

    // Encontrar categorias ativas de um usuário
    List<Category> findByUserIdAndStatusAndType(Long userId, Constants.Status status, Constants.CategoryType type);

    // Deletar uma categoria pelo nome
    void deleteByName(String name);

    // Buscar categorias por status e tipo
    List<Category> findByStatusAndType(Constants.Status status, Constants.CategoryType type);
}