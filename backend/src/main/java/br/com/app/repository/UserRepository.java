package br.com.app.repository;

import br.com.app.Constants;
import br.com.app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByStatus(Constants.Status status);
    List<User> findByType(Constants.UserType type);

    @Query("SELECT u FROM User u WHERE u.login = :login AND u.password = :password AND u.status = 0")
    Optional<User> findByLoginAndPassword(@Param("login") String login, @Param("password") String password);

}
