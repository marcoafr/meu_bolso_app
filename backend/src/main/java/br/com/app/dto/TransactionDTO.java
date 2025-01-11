package br.com.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TransactionDTO {
    private Long id;
    private BigDecimal totalAmount;
    private LocalDate issueDate;
    private Integer status;
    private Long categoryId;
    private String description;
    private List<ReceivableDTO> receivables;

    public TransactionDTO(Long id, BigDecimal totalAmount, LocalDate issueDate, Integer status, Long categoryId, String description, List<ReceivableDTO> receivables) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.issueDate = issueDate;
        this.status = status;
        this.categoryId = categoryId;
        this.description = description;
        this.receivables = receivables;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<ReceivableDTO> getReceivables() {
        return receivables;
    }

    public void setReceivables(List<ReceivableDTO> receivables) {
        this.receivables = receivables;
    }
}
