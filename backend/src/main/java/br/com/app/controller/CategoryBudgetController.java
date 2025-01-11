package br.com.app.controller;

import br.com.app.Constants;
import br.com.app.dto.CategoryBudgetDTO;
import br.com.app.repository.CategoryBudgetRepository;
import br.com.app.model.CategoryBudget;
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
@RequestMapping("/api/category-budgets")
public class CategoryBudgetController {

    @Autowired
    private CategoryBudgetRepository categoryBudgetRepository;

    // Endpoint de pesquisa de contas bancárias por userId
    @PostMapping("/search")
    public List<CategoryBudgetDTO> findByUserId(@RequestBody Long userId) {
        List<CategoryBudget> categoryBudgets = categoryBudgetRepository.findByUserIdAndStatus(userId, Constants.Status.ACTIVE);

        // Convertendo de CreditCard para CreditCardDTO
        return categoryBudgets.stream()
                .map(categoryBudget -> new CategoryBudgetDTO(
                        categoryBudget.getId(),
                        null,
                        categoryBudget.getCategory().getId(),
                        categoryBudget.getAmount(),
                        categoryBudget.getStatus().getValue(),
                        categoryBudget.getCategory().getName(),
                        categoryBudget.getCategory().getType().getValue()))
                .collect(Collectors.toList());
    }

    // Endpoint para adicionar um novo cartão de crédito
    @PostMapping("/add")
    public CategoryBudgetDTO addCategoryBudget(@RequestBody CategoryBudgetDTO categoryBudgetDTO) {
        CategoryBudget categoryBudget = new CategoryBudget();
        categoryBudget.setUser(new User());
        categoryBudget.getUser().setId(categoryBudgetDTO.getUserId());
        categoryBudget.setCategory(new Category());
        categoryBudget.getCategory().setId(categoryBudgetDTO.getCategoryId());
        categoryBudget.setAmount(categoryBudgetDTO.getAmount());
        categoryBudget.setStatus(Constants.Status.ACTIVE);

        CategoryBudget savedCategoryBudget = categoryBudgetRepository.save(categoryBudget);

        return new CategoryBudgetDTO(
            savedCategoryBudget.getId(),
            null,
            null,
            savedCategoryBudget.getAmount(),
            savedCategoryBudget.getStatus().getValue(),
            null,
            null);
    }

    // Endpoint para editar um cartão de crédito existente
    @PostMapping("/edit")
    public CategoryBudgetDTO editCategoryBudget(@RequestBody CategoryBudgetDTO categoryBudgetDTO) {
        CategoryBudget categoryBudget = categoryBudgetRepository.findById(categoryBudgetDTO.getId())
                .orElseThrow(() -> new RuntimeException("Orçamento não encontrado"));

        categoryBudget.setAmount(categoryBudgetDTO.getAmount());
        categoryBudget.setCategory(new Category());
        categoryBudget.getCategory().setId(categoryBudgetDTO.getCategoryId());
        if (categoryBudgetDTO.getStatus() != null) {
                categoryBudget.setStatus(categoryBudgetDTO.getStatus() == 0 ? Constants.Status.ACTIVE : Constants.Status.INACTIVE);
        }

        CategoryBudget updatedCategoryBudget = categoryBudgetRepository.save(categoryBudget);

        return new CategoryBudgetDTO(
            updatedCategoryBudget.getId(), 
            null,
            null,
            updatedCategoryBudget.getAmount(),
            updatedCategoryBudget.getStatus().getValue(),
            null,
            null);
    }
}
