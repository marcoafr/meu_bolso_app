package br.com.app.dto;

import java.math.BigDecimal;

public class BankAccountDTO {

    private Long id;
    private Long userId;
    private String name;
    private String color;
    private BigDecimal initialAmount;
    private Integer status;

    public BankAccountDTO() {
        
    }

    // Construtor
    public BankAccountDTO(Long id, Long userId, String name, String color, BigDecimal initialAmount, Integer status) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.color = color;
        this.initialAmount = initialAmount;
        this.status = status;
    }

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public BigDecimal getInitialAmount() {
        return initialAmount;
    }

    public void setInitialAmount(BigDecimal initialAmount) {
        this.initialAmount = initialAmount;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
