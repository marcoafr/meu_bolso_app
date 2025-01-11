package br.com.app.service;

import br.com.app.model.Category;
import br.com.app.repository.CategoryRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }    

    /**
    * Busca uma categoria pelo ID.
    *
    * @param categoryId ID da categoria a ser buscada.
    * @return Categoria encontrada ou null se não for encontrada.
    */
    public Category getCategoryById(Long categoryId) {
        Optional<Category> category = categoryRepository.findById(categoryId);
        return category.orElse(null);
    }
}
