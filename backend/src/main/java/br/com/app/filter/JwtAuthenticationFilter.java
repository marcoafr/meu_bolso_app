package br.com.app.filter;

import br.com.app.service.AuthService;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter implements Filter {

    @Autowired
    private AuthService authService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String authHeader = httpRequest.getHeader("Authorization");

        // Permitir requisições para o endpoint de login ou público
        if (httpRequest.getRequestURI().equals("/api/auth/login") || httpRequest.getRequestURI().startsWith("/api")) {
            chain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7); // Remover "Bearer " do início

        try {
            // Validar o token
            System.out.println(token);
            DecodedJWT decodedJWT = authService.validateJwtToken(token);
            System.out.println("Token válido. ID do usuário: " + decodedJWT.getSubject());

            // Verificar se está expirado
            if (authService.isTokenExpired(token)) {
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("Token expired");
                return;
            }

            // Token válido, prossiga com a requisição
            chain.doFilter(request, response);
        } catch (Exception e) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Invalid token");
        }
    }
}
