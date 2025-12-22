package com.hr.auth.controller;

import com.hr.auth.dto.AuthRequest;
import com.hr.auth.dto.AuthResponse;
import com.hr.auth.entity.User;
import com.hr.auth.repository.UserRepository;
import com.hr.auth.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;
    private final UserRepository repository;

     public AuthController(AuthService service, UserRepository repository) {
        this.service = service;
        this.repository = repository;
    }

    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    @PostMapping("/login")
    public AuthResponse getToken(@RequestBody AuthRequest authRequest) {
        if (service.validateUser(authRequest.getUsername(), authRequest.getPassword())) {
            String token = service.generateToken(authRequest.getUsername());
            
            // Kullanıcı detaylarını bul
            User user = repository.findByUsername(authRequest.getUsername()).orElseThrow();
            
            return new AuthResponse(token, user.getRole(), user.getEmployeeId());
        } else {
            throw new RuntimeException("Giriş başarısız!");
        }
    }
    
    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token); 
        return "Token geçerli";
    }

    @PutMapping("/users/{employeeId}/role")
    public void updateUserRole(@PathVariable Long employeeId, @RequestParam String role) {
        service.updateUserRole(employeeId, role);
    }
}