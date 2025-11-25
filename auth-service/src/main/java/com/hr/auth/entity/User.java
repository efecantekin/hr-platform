package com.hr.auth.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users") // PostgreSQL'de 'user' yasaklı kelime olabilir, 'users' yapalım
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Şifrelenmiş halde tutacağız

    private String role; // ADMIN, USER, MANAGER vs.
    
    // Hangi çalışana bağlı olduğu (Employee Service ile eşleşmek için)
    private Long employeeId; 
}