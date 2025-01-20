package br.com.app.dto;

import java.math.BigDecimal;

public class CategoryBudgetDTO {

    private Long id;
    private Long userId;
    private Long categoryId;
    private BigDecimal amount;
    private Integer status;
    private String categoryName;
    private Integer categoryType;

    public CategoryBudgetDTO() {
        
    }

    // Construtor
    public CategoryBudgetDTO(Long id, Long userId, Long categoryId, BigDecimal amount, Integer status, String categoryName, Integer categoryType) {
        this.id = id;
        this.userId = userId;
        this.categoryId = categoryId;
        this.amount = amount;
        this.status = status;
        this.categoryName = categoryName;
        this.categoryType = categoryType;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public Integer getCategoryType() {
        return categoryType;
    }

    public void setCategoryType(Integer categoryType) {
        this.categoryType = categoryType;
    }
}
