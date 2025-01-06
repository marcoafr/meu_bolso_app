package br.com.app.service;

import br.com.app.Constants;
import br.com.app.model.User;
import br.com.app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getActiveUsers() {
        return userRepository.findByStatus(Constants.Status.ACTIVE);
    }

    public List<User> getAdmins() {
        return userRepository.findByType(Constants.UserType.ADMIN);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }
}
