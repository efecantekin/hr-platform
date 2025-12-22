package com.hr.employee.client;

import com.hr.employee.dto.RegisterRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

// DİKKAT: url kısmı application.yml dosyasındaki değişkeni okumalıdır.
@FeignClient(name = "auth-service", url = "${AUTH_SERVICE_URL}")
public interface AuthClient {

    @PostMapping("/auth/register")
    String registerUser(@RequestBody RegisterRequest request);

    // Rol güncelleme metodu
    @PutMapping("/auth/users/{employeeId}/role")
    void updateUserRole(@PathVariable("employeeId") Long employeeId, @RequestParam("role") String role);
}