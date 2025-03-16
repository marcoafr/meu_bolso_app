package br.com.app.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class HeritageEvolutionResponseDTO {
    private Long accountId;
    private String accountName;
    private String accountColor;
    private BigDecimal balanceAtPeriod;
    private LocalDate periodDate;
    private List<HeritageEvolutionResponseDTO> bankAccountsBalances;

    // Construtores
    public HeritageEvolutionResponseDTO() {
        // Construtor padrão
    }

    public HeritageEvolutionResponseDTO(Long accountId, String accountName, String accountColor, BigDecimal balanceAtPeriod, LocalDate periodDate) {
        this.accountId = accountId;
        this.accountName = accountName;
        this.accountColor = accountColor;
        this.balanceAtPeriod = balanceAtPeriod;
        this.periodDate = periodDate;
        this.bankAccountsBalances = new ArrayList<>();  // Inicializando a lista
    }

    public HeritageEvolutionResponseDTO(Long accountId, String accountName, String accountColor, BigDecimal balanceAtPeriod, LocalDate periodDate, List<HeritageEvolutionResponseDTO> bankAccountsBalances) {
        this.accountId = accountId;
        this.accountName = accountName;
        this.accountColor = accountColor;
        this.balanceAtPeriod = balanceAtPeriod;
        this.periodDate = periodDate;
        this.bankAccountsBalances = bankAccountsBalances;
    }


    // Getters and Setters
    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAccountColor() {
        return accountColor;
    }

    public void setAccountColor(String accountColor) {
        this.accountColor = accountColor;
    }

    public BigDecimal getBalanceAtPeriod() {
        return balanceAtPeriod;
    }

    public void setBalanceAtPeriod(BigDecimal balanceAtPeriod) {
        this.balanceAtPeriod = balanceAtPeriod;
    }

    public LocalDate getPeriodDate() {
        return periodDate;
    }

    public void setPeriodDate(LocalDate periodDate) {
        this.periodDate = periodDate;
    }

    public List<HeritageEvolutionResponseDTO> getBankAccountsBalances() {
        return bankAccountsBalances;
    }

    public void setBankAccountsBalances(List<HeritageEvolutionResponseDTO> bankAccountsBalances) {
        this.bankAccountsBalances = bankAccountsBalances;
    }
}
