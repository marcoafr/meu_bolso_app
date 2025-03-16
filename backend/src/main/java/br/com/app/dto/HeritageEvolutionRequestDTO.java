package br.com.app.dto;

public class HeritageEvolutionRequestDTO {
    private Long userId;
    private Integer monthsAmount;

    // Getters e Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getMonthsAmount() {
        return monthsAmount;
    }

    public void setMonthsAmount(Integer monthsAmount) {
        this.monthsAmount = monthsAmount;
    }
}
