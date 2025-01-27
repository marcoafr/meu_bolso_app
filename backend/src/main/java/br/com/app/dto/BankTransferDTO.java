package br.com.app.dto;

import java.math.BigDecimal;

public class BankTransferDTO {
    private Long fromBankAccount;
    private Long toBankAccount;
    private Long userId;
    private BigDecimal amount;

    // Getters e Setters
    public Long getFromBankAccount() {
        return fromBankAccount;
    }

    public void setFromBankAccount(Long fromBankAccount) {
        this.fromBankAccount = fromBankAccount;
    }

    public Long getToBankAccount() {
        return toBankAccount;
    }

    public void setToBankAccount(Long toBankAccount) {
        this.toBankAccount = toBankAccount;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
