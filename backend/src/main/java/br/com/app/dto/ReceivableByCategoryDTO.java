package br.com.app.dto;

import java.math.BigDecimal;

import br.com.app.Constants;

public class ReceivableByCategoryDTO {

    private Long categoryId;
    private String categoryName;
    private Constants.CategoryType categoryType;
    private BigDecimal totalAmount;
    private BigDecimal totalPaidAmount;
    private BigDecimal totalExpected;

    public ReceivableByCategoryDTO(Long categoryId, String categoryName, Constants.CategoryType categoryType, BigDecimal totalAmount, BigDecimal totalPaidAmount, BigDecimal totalExpected) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.categoryType = categoryType;
        this.totalAmount = totalAmount;
        this.totalPaidAmount = totalPaidAmount;
        this.totalExpected = totalExpected;
    }

    // Getters e setters
    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Constants.CategoryType getCategoryType() {
        return categoryType;
    }

    public void setCategoryType(Constants.CategoryType categoryType) {
        this.categoryType = categoryType;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public BigDecimal getTotalExpected() {
        return totalExpected;
    }

    public void setTotalExpected(BigDecimal totalExpected) {
        this.totalExpected = totalExpected;
    }
}

