package com.hr.auth.controller;

import com.hr.auth.dto.AuthRequest;
import com.hr.auth.dto.AuthResponse;
import com.hr.auth.entity.User;
import com.hr.auth.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    // KAYIT OL (Register)
    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    // GİRİŞ YAP (Login)
    @PostMapping("/login")
    public AuthResponse getToken(@RequestBody AuthRequest authRequest) {
        if (service.validateUser(authRequest.getUsername(), authRequest.getPassword())) {
            
            // 1. Token üret
            String token = service.generateToken(authRequest.getUsername());
            
            // 2. Kullanıcı bilgilerini bul (Rol ve ID için)
            // Not: Bu işlem için AuthService'e findByUsername eklememiz gerekebilir
            // Şimdilik demo için rolü veritabanından çekmek yerine manuel simüle edelim:
            
            // Normalde: User user = repository.findByUsername(...);
            // Şimdilik admin ise ADMIN, değilse USER diyelim:
            String role = authRequest.getUsername().equals("admin") ? "ADMIN" : "USER";
            Long empId = 1L; // Şimdilik 1 varsayıyoruz

            return new AuthResponse(token, role, empId);
        } else {
            throw new RuntimeException("Giriş başarısız!");
        }
    }
    
    // Token Kontrolü (Gateway buraya soracak)
    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token); // Hata varsa burada patlar
        return "Token geçerli";
    }
}