package br.com.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReceivableDTO {
    private Long id;
    private BigDecimal amount;
    private LocalDate competenceDate;
    private LocalDate cardCompetenceDate;
    private Integer status;
    private Long bankId;
    private String bankName;
    private TransactionDTO transactionDTO;
    private String metadata;  // Novo campo metadata
    private BigDecimal paidAmount;
    private LocalDate paymentDate;

    public ReceivableDTO() {
        
    }

    public ReceivableDTO(Long id, BigDecimal amount, LocalDate competenceDate, LocalDate cardCompetenceDate, Integer status, Long bankId ,String bankName, TransactionDTO transactionDTO, String metadata, BigDecimal paidAmount, LocalDate paymentDate) {
        this.id = id;
        this.amount = amount;
        this.competenceDate = competenceDate;
        this.cardCompetenceDate = cardCompetenceDate;
        this.status = status;
        this.bankId = bankId;
        this.bankName = bankName;
        this.transactionDTO = transactionDTO;
        this.metadata = metadata;
        this.paidAmount = paidAmount;
        this.paymentDate = paymentDate;
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

    public LocalDate getCardCompetenceDate() {
        return cardCompetenceDate;
    }

    public void setCardCompetenceDate(LocalDate cardCompetenceDate) {
        this.cardCompetenceDate = cardCompetenceDate;
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
    
    public TransactionDTO getTransactionDTO() {
        return transactionDTO;
    }
    
    public void setTransactionDTO(TransactionDTO transactionDTO) {
        this.transactionDTO = transactionDTO;
    }
    
    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }
    
    public LocalDate getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }
}
