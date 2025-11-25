package com.hr.auth.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;      // ADMIN, MANAGER, USER vs.
    private Long employeeId;  // Çalışan ID'si (Frontend'de işimize yarayacak)
}