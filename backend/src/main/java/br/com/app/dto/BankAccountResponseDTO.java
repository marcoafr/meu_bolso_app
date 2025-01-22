package br.com.app.dto;

import java.math.BigDecimal;

public class BankAccountResponseDTO {
    private Long id;
    private String name;
    private String color;
    private BigDecimal currentBalance;

    public BankAccountResponseDTO() {
        
    }

    public BankAccountResponseDTO(Long id, String name, String color, BigDecimal currentBalance) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.currentBalance = currentBalance;
    }

    // Getters e setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }
}
