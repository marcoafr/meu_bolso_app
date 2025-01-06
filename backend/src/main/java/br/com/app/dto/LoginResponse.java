package br.com.app.dto;

public class LoginResponse {
    private Long userId;
    private String name;
    private String email;
    private String token;

    public LoginResponse(Long userId, String name, String email, String token) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.token = token;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getToken() {
        return token;
    }
}
