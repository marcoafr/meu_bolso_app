package br.com.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class UpdateReceivableDTO {
    private Long receivableId;
    private Long categoryId;
    private BigDecimal amount;
    private LocalDate competenceDate;

    // Getters e Setters

    public Long getReceivableId() {
        return receivableId;
    }

    public void setReceivableId(Long receivableId) {
        this.receivableId = receivableId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getCompetenceDate() {
        return competenceDate;
    }

    public void setCompetenceDate(LocalDate competenceDate) {
        this.competenceDate = competenceDate;
    }
}
