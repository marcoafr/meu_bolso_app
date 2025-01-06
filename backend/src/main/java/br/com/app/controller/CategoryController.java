package br.com.app.controller;

import br.com.app.model.Category;
import br.com.app.service.CategoryService;
import br.com.app.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // Endpoint para obter todas as categorias de um usuário com um status específico
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<Category>> getCategoriesByUserIdAndStatus(
            @PathVariable Long userId, @PathVariable Constants.Status status) {
        List<Category> categories = categoryService.getCategoriesByUserIdAndStatus(userId, status);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Endpoint para obter uma categoria específica pelo nome e tipo
    @GetMapping("/name/{name}/type/{type}")
    public ResponseEntity<Category> getCategoryByNameAndType(
            @PathVariable String name, @PathVariable Constants.CategoryType type) {
        Optional<Category> category = categoryService.getCategoryByNameAndType(name, type);
        return category.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Endpoint para obter todas as categorias de um tipo específico
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Category>> getCategoriesByType(@PathVariable Constants.CategoryType type) {
        List<Category> categories = categoryService.getCategoriesByType(type);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Endpoint para obter todas as categorias ativas de um usuário
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<Category>> getActiveCategoriesByUserId(@PathVariable Long userId) {
        List<Category> categories = categoryService.getActiveCategoriesByUserId(userId);
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    // Endpoint para criar uma nova categoria
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        // Aqui você pode adicionar uma validação antes de salvar a categoria
        Category savedCategory = categoryService.createCategory(category);
        return new ResponseEntity<>(savedCategory, HttpStatus.CREATED);
    }
}