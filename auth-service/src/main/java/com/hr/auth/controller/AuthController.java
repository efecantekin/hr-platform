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

    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    
    @PostMapping("/login")
    public AuthResponse getToken(@RequestBody AuthRequest authRequest) {
        if (service.validateUser(authRequest.getUsername(), authRequest.getPassword())) {
            
            
            String token = service.generateToken(authRequest.getUsername());
            String role = authRequest.getUsername().equals("admin") ? "ADMIN" : "USER";
            Long empId = 1L; 

            return new AuthResponse(token, role, empId);
        } else {
            throw new RuntimeException("Giriş başarısız!");
        }
    }
    
    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token); 
        return "Token geçerli";
    }
}