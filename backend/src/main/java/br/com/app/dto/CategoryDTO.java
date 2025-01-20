package br.com.app.dto;

public class CategoryDTO {

    private Long id;
    private Long userId;
    private String name;
    private Integer type;
    private Integer status;

    public CategoryDTO() {
        
    }
    
    // Construtor
    public CategoryDTO(Long id, Long userId, String name, Integer type, Integer status) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.type = type;
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

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
