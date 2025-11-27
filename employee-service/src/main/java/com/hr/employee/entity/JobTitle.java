package com.hr.employee.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "job_titles")
@Data
public class JobTitle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title; 
}