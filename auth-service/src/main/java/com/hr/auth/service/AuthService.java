package com.hr.auth.service;

import com.hr.auth.entity.User;
import com.hr.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        repository.save(user);
        return "Kullanıcı sisteme eklendi";
    }

    public String generateToken(String username) {
        return jwtService.generateToken(username);
    }
    
    public boolean validateUser(String username, String password) {
        Optional<User> user = repository.findByUsername(username);
        return user.isPresent() && passwordEncoder.matches(password, user.get().getPassword());
    }

    public void validateToken(String token) {
        jwtService.validateToken(token);
    }

    public void updateUserRole(Long employeeId, String newRole) {
        System.out.println("BURADAYIM");
        User user = repository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı (Employee ID: " + employeeId + ")"));
        
        // Sadece rol farklıysa güncelle (Gereksiz yazma işlemini önle)
        if (!newRole.equals(user.getRole())) {
            user.setRole(newRole);
            repository.save(user);
            System.out.println("Kullanıcı rolü güncellendi: " + user.getUsername() + " -> " + newRole);
        }
    }
}