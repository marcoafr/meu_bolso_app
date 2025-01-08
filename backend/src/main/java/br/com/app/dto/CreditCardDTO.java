package br.com.app.dto;

public class CreditCardDTO {

    private Long id;
    private String name;
    private String color;
    private Integer closingDay;
    private Integer payingDay;
    private Integer status;

    // Construtor
    public CreditCardDTO(Long id, String name, String color, Integer closingDay, Integer payingDay, Integer status) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.closingDay = closingDay;
        this.payingDay = payingDay;
        this.status = status;
    }

    // Getters e Setters
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

    public Integer getClosingDay() {
        return closingDay;
    }

    public void setClosingDay(Integer closingDay) {
        this.closingDay = closingDay;
    }

    public Integer getPayingDay() {
        return payingDay;
    }

    public void setPayingDay(Integer payingDay) {
        this.payingDay = payingDay;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
