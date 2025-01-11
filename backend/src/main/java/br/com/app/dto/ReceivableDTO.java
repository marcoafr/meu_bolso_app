package br.com.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReceivableDTO {
    private Long id;
    private BigDecimal amount;
    private LocalDate competenceDate;
    private Integer status;
    private Long bankId;
    private String bankName;

    public ReceivableDTO(Long id, BigDecimal amount, LocalDate competenceDate, Integer status, Long bankId ,String bankName) {
        this.id = id;
        this.amount = amount;
        this.competenceDate = competenceDate;
        this.status = status;
        this.bankId = bankId;
        this.bankName = bankName;
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

    public Long getBankId() {
        return bankId;
    }

    public void setBankId(Long bankId) {
        this.bankId = bankId;
    }
    
    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }
}
