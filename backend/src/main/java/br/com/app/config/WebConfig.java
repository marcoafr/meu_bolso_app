package br.com.app.config;  // Pacote sugerido

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configuração global para todas as rotas começando com /api
        registry.addMapping("/api/**")
                //.allowedOrigins("http://localhost:5173")  // Permite requisições de localhost:5173
                .allowedOrigins("http://103.199.186.65:5173")  // Permite requisições de 103.199.186.65:5173
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")  // Permite qualquer cabeçalho
                .allowCredentials(true); // Permite envio de cookies, tokens, etc.
    }
}
