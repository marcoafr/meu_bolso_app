package br.com.app.service;

import br.com.app.dto.LoginRequest;
import br.com.app.dto.LoginResponse;
import br.com.app.exception.AuthenticationException;
import br.com.app.model.User;
import br.com.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.util.Optional;
import java.util.Date;
import java.security.NoSuchAlgorithmException;
import java.security.MessageDigest;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // Segredo para assinatura do token, obtido a partir da variável de ambiente
    private static final String SECRET_KEY = System.getenv("JWT_SECRET_KEY");

    public LoginResponse authenticate(LoginRequest request) {
        // Hash da senha em MD5
        String hashedLogin = hashMD5(request.getLogin());
        String hashedPassword = hashMD5(request.getPassword());

        // Busca o usuário pelo login e senha hash
        Optional<User> userOptional = userRepository.findByLoginAndPassword(hashedLogin, hashedPassword);

        User user = userOptional.orElseThrow(() -> new AuthenticationException("Credenciais inválidas"));

        // Gerar o token JWT
        String token = generateJwtToken(user);

        return new LoginResponse(user.getId(), user.getName(), user.getEmail(), token);
    }

    private String hashMD5(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();

            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash MD5", e);
        }
    }

    // Método para gerar o JWT
    public String generateJwtToken(User user) {
        // Verifique se o segredo está disponível
        if (SECRET_KEY == null || SECRET_KEY.isEmpty()) {
            throw new RuntimeException("JWT_SECRET_KEY não está configurado.");
        }

        // Definir tempo de expiração (1 hora)
        long expirationTime = 1000 * 60 * 60; // 1 hora

        // Gerar o token usando a biblioteca Java JWT
        return JWT.create()
            .withSubject(String.valueOf(user.getId()))  // Define o assunto como o ID do usuário
            .withClaim("name", user.getName())  // Adiciona o nome
            .withClaim("email", user.getEmail())  // Adiciona o e-mail
            .withIssuedAt(new Date())  // Define a data de emissão
            .withExpiresAt(new Date(System.currentTimeMillis() + expirationTime))  // Define a data de expiração
            .sign(Algorithm.HMAC256(SECRET_KEY));  // Assina com HMAC256
    }

    // Método para validar o JWT
    public DecodedJWT validateJwtToken(String token) {
        try {
            // Verifique se o segredo está disponível
            if (SECRET_KEY == null || SECRET_KEY.isEmpty()) {
                throw new RuntimeException("JWT_SECRET_KEY não está configurado.");
            }
            
            // Validar e decodificar o token JWT
            return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                    .build()
                    .verify(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    // Método para verificar se o token está expirado
    public boolean isTokenExpired(String token) {
        DecodedJWT decodedJWT = validateJwtToken(token);
        return decodedJWT.getExpiresAt().before(new Date());
    }
}
