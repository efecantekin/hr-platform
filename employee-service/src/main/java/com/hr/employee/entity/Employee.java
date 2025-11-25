package com.hr.employee.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
@Data // Lombok: Getter/Setter metodlarını bizim yerimize yazar
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phoneNumber;

    private LocalDate hireDate;

    private String department;

    private String jobTitle;

    private Long managerId;

    private String city;
    
    private boolean isActive = true;

    private Long teamId;
}