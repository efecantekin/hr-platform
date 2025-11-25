package com.hr.employee.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "teams")
@Data
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Örn: "Backend Geliştirme Ekibi"

    private Long managerId; // Bu ekibin yöneticisi kim? (Employee ID)
}