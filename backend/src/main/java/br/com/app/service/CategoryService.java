package br.com.app.service;

import br.com.app.model.Category;
import br.com.app.Constants;
import br.com.app.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getCategoriesByUserIdAndStatus(Long userId, Constants.Status status) {
        return categoryRepository.findByUserIdAndStatus(userId, status);
    }

    public Optional<Category> getCategoryByNameAndType(String name, Constants.CategoryType type) {
        return categoryRepository.findByNameAndType(name, type);
    }

    public List<Category> getCategoriesByType(Constants.CategoryType type) {
        return categoryRepository.findByType(type);
    }

    public List<Category> getActiveCategoriesByUserId(Long userId) {
        return categoryRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);
    }

    public void deleteCategoryByName(String name) {
        categoryRepository.deleteByName(name);
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }
}