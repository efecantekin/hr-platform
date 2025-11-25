package com.hr.auth.dto;

import lombok.Data;

@Data // Getter ve Setter'ları otomatik yazar
public class AuthRequest {
    private String username;
    private String password;
}