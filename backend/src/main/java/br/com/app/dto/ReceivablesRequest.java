package br.com.app.dto;

import java.time.LocalDate;
import java.util.List;

public class ReceivablesRequest {

    private List<Long> bankAccounts;
    private List<Long> categories;
    private List<Long> creditCards;
    private LocalDate from;
    private LocalDate to;
    private List<Integer> status;
    private Integer transactionType;
    private Integer page;
    private Integer pageSize;
    private Long userId;

    // Getters and Setters
    public List<Long> getBankAccounts() {
        return bankAccounts;
    }

    public void setBankAccounts(List<Long> bankAccounts) {
        this.bankAccounts = bankAccounts;
    }

    public List<Long> getCategories() {
        return categories;
    }

    public void setCategories(List<Long> categories) {
        this.categories = categories;
    }

    public List<Long> getCreditCards() {
        return creditCards;
    }

    public void setCreditCards(List<Long> creditCards) {
        this.creditCards = creditCards;
    }

    public LocalDate getFrom() {
        return from;
    }

    public void setFrom(LocalDate from) {
        this.from = from;
    }

    public LocalDate getTo() {
        return to;
    }

    public void setTo(LocalDate to) {
        this.to = to;
    }

    public List<Integer> getStatus() {
        return status;
    }

    public void setStatus(List<Integer> status) {
        this.status = status;
    }

    public Integer getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(Integer transactionType) {
        this.transactionType = transactionType;
    }

    // Validating dates to ensure "to" is at most 365 days after "from"
    public boolean validateDateRange() {
        if (from != null && to != null) {
            return !to.isBefore(from) && to.isBefore(from.plusDays(365));
        }
        return false;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
