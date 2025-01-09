package br.com.app.controller;

import br.com.app.Constants;
import br.com.app.dto.CategoryDTO;
import br.com.app.repository.CategoryRepository;
import br.com.app.model.Category;
import br.com.app.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // Endpoint de pesquisa de contas bancárias por userId
    @PostMapping("/search")
    public List<CategoryDTO> findByUserId(@RequestBody Long userId) {
        List<Category> categories = categoryRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);

        // Convertendo de CreditCard para CreditCardDTO
        return categories.stream()
                .map(category -> new CategoryDTO(
                        category.getId(),
                        null,
                        category.getName(),
                        category.getType().getValue(),
                        category.getStatus().getValue()))
                .collect(Collectors.toList());
    }

    // Endpoint para adicionar um novo cartão de crédito
    @PostMapping("/add")
    public CategoryDTO addCategory(@RequestBody CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setUser(new User());
        category.getUser().setId(categoryDTO.getUserId());
        category.setName(categoryDTO.getName());
        category.setType(categoryDTO.getType() == 0 ? Constants.CategoryType.RECEIPT : Constants.CategoryType.EXPENSE);
        category.setStatus(Constants.Status.ACTIVE);

        Category savedCategory = categoryRepository.save(category);

        return new CategoryDTO(
            savedCategory.getId(),
            null,
            savedCategory.getName(),
            savedCategory.getType().getValue(),
            savedCategory.getStatus().getValue());
    }

    // Endpoint para editar um cartão de crédito existente
    @PostMapping("/edit")
    public CategoryDTO editCategory(@RequestBody CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(categoryDTO.getId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        category.setName(categoryDTO.getName());
        category.setType(categoryDTO.getType() == 0 ? Constants.CategoryType.RECEIPT : Constants.CategoryType.EXPENSE);
        if (categoryDTO.getStatus() != null) {
                category.setStatus(categoryDTO.getStatus() == 0 ? Constants.Status.ACTIVE : Constants.Status.INACTIVE);
        }

        Category updatedCategory = categoryRepository.save(category);

        return new CategoryDTO(
            updatedCategory.getId(), 
            null,
            updatedCategory.getName(),
            updatedCategory.getType().getValue(), 
            updatedCategory.getStatus().getValue());
    }
}
