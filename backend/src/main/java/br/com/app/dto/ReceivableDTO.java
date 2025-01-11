package br.com.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReceivableDTO {
    private Long id;
    private BigDecimal amount;
    private LocalDate competenceDate;
    private Integer status;

    public ReceivableDTO(Long id, BigDecimal amount, LocalDate competenceDate, Integer status) {
        this.id = id;
        this.amount = amount;
        this.competenceDate = competenceDate;
        this.status = status;
    }

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
